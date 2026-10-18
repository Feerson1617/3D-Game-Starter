import io
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile
import importlib.util

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

if __name__=='__main__': unittest.main()
