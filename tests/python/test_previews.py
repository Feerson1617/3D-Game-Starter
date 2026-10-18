import io
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile
import importlib.util
from urllib.request import Request
from unittest.mock import patch

SCRIPT=Path(__file__).resolve().parents[2]/'.github/scripts/assemble_pages.py'
spec=importlib.util.spec_from_file_location('assemble_pages',SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def artifact(files):
    buf=io.BytesIO()
    with ZipFile(buf,'w') as z:
        for name,data in files.items(): z.writestr(name,data)
    return buf.getvalue()

class PreviewZipTests(unittest.TestCase):
    def test_cross_host_redirect_removes_token(self):
        request=Request('https://api.github.com/artifact',headers={'Authorization':'Bearer test-token'})
        redirected=mod.SafeRedirect().redirect_request(request,None,302,'Found',{},'https://storage.example/artifact.zip')
        self.assertIsNone(redirected.get_header('Authorization'))
    def test_redirect_to_http_is_rejected(self):
        with self.assertRaises(ValueError):
            mod.SafeRedirect().redirect_request(Request('https://api.github.com/artifact'),None,302,'Found',{},'http://storage.example/a.zip')
    def test_valid_preview(self):
        b=artifact({'index.html':'<html>bereit</html>', '.preview-info.json':json.dumps({'pr':7,'head_sha':'abc'})})
        with tempfile.TemporaryDirectory() as path:
            dest=Path(path)/'pr-7'
            mod.safely_extract(b,dest,7,'abc')
            self.assertTrue((dest/'index.html').is_file())
    def test_path_traversal_rejected(self):
        b=artifact({'../../outside.html':'evil', 'index.html':'fine', '.preview-info.json':json.dumps({'pr':7,'head_sha':'abc'})})
        with tempfile.TemporaryDirectory() as path:
            with self.assertRaises(ValueError): mod.safely_extract(b,Path(path)/'pr-7',7,'abc')
    def test_stale_commit_rejected(self):
        b=artifact({'index.html':'ok', '.preview-info.json':json.dumps({'pr':7,'head_sha':'old'})})
        with tempfile.TemporaryDirectory() as path:
            with self.assertRaises(ValueError): mod.safely_extract(b,Path(path)/'pr-7',7,'new')
    def test_absolute_and_backslash_paths_rejected(self):
        for name in ['/outside.html', '..\\outside.html']:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as path:
                with self.assertRaises(ValueError):
                    mod.safely_extract(artifact({name:'evil'}),Path(path)/'pr-7',7,'abc')
    def test_symlink_rejected(self):
        from zipfile import ZipInfo
        buf=io.BytesIO()
        with ZipFile(buf,'w') as z:
            entry=ZipInfo('link');entry.external_attr=(0o120777 << 16)
            z.writestr(entry,'../../outside')
        with tempfile.TemporaryDirectory() as path:
            with self.assertRaises(ValueError): mod.safely_extract(buf.getvalue(),Path(path)/'pr-7',7,'abc')

class PagesUrlTests(unittest.TestCase):
    def test_names_and_user_site(self):
        script=SCRIPT.with_name('comment_previews.py')
        urlspec=importlib.util.spec_from_file_location('comment_previews',script)
        comments=importlib.util.module_from_spec(urlspec);urlspec.loader.exec_module(comments)
        self.assertEqual(comments.pages_url('Teacher/Neues-Spiel'),'https://teacher.github.io/Neues-Spiel')
        self.assertEqual(comments.pages_url('Teacher/Teacher.github.io'),'https://teacher.github.io')

class AssemblyTests(unittest.TestCase):
    def test_current_preview_failure_does_not_silently_deploy(self):
        prs=[{'number':1,'head':{'sha':'current','repo':{'full_name':'owner/repo'}}}]
        def api(path,raw=False):
            if path.startswith('/pulls?'): return prs
            return {'workflow_runs':[]}
        with tempfile.TemporaryDirectory() as path:
            root=Path(path);(root/'dist').mkdir();(root/'dist/index.html').write_text('production')
            event=root/'event.json';event.write_text(json.dumps({'workflow_run':{'conclusion':'success','head_sha':'current','pull_requests':[{'number':1}]}}))
            with patch.multiple(mod,ROOT=root,SITE=root/'site',REPO='owner/repo',TOKEN='test'),patch.object(mod,'github',api),patch.dict('os.environ',{'GITHUB_EVENT_PATH':str(event)}):
                with self.assertRaises(RuntimeError): mod.main()
    def test_multiple_previews_and_closed_cleanup_preserve_main(self):
        prs=[{'number':n,'head':{'sha':f'sha-{n}','repo':{'full_name':'owner/repo'}}} for n in [1,2]]
        runs=[{'id':n,'pull_requests':[{'number':n}],'conclusion':'success'} for n in [1,2]]
        def api(path,raw=False):
            if path.startswith('/pulls?'): return prs
            if path.startswith('/actions/workflows/'): return {'workflow_runs':runs}
            n=1 if '/1/' in path else 2
            if raw: return artifact({'index.html':f'preview-{n}','.preview-info.json':json.dumps({'pr':n,'head_sha':f'sha-{n}'})})
            return {'artifacts':[{'name':f'preview-pr-{n}','expired':False,'archive_download_url':f'https://api.github.com/repos/owner/repo/{n}/zip'}]}
        with tempfile.TemporaryDirectory() as path:
            root=Path(path);(root/'dist').mkdir();(root/'dist/index.html').write_text('production')
            with patch.multiple(mod,ROOT=root,SITE=root/'site',REPO='owner/repo',TOKEN='test'),patch.object(mod,'github',api):
                mod.main()
                self.assertEqual((root/'site/index.html').read_text(),'production')
                for n in [1,2]: self.assertEqual((root/f'site/pr-preview/pr-{n}/index.html').read_text(),f'preview-{n}')
                prs.pop(0)
                mod.main()
                self.assertFalse((root/'site/pr-preview/pr-1').exists())
                self.assertTrue((root/'site/pr-preview/pr-2/index.html').exists())
                self.assertEqual((root/'site/index.html').read_text(),'production')

if __name__=='__main__': unittest.main()
