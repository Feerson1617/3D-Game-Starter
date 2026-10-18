"""Assemble trusted production build and validated, unexecuted PR build artifacts.

Runs ONLY from main on a privileged GitHub runner. PR npm builds run in the
separate, read-only pull_request workflow; this script treats ZIP files as data.
"""
import io
import json
import os
from pathlib import Path
import shutil
import stat
import sys
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.parse import urlsplit
from zipfile import ZipFile

REPO = os.environ.get('GITHUB_REPOSITORY', '')
TOKEN = os.environ.get('GH_TOKEN', '')
ROOT = Path.cwd()
SITE = ROOT / 'site'
MAX_PRS = 12
MAX_FILE_BYTES = 25_000_000
MAX_PREVIEW_BYTES = 100_000_000


class SafeRedirect(HTTPRedirectHandler):
    """GitHub redirects artifacts to signed storage URLs; never forward its token."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if urlsplit(newurl).scheme != 'https':
            raise ValueError('Artifact redirect must use HTTPS')
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected is not None and urlsplit(req.full_url).netloc != urlsplit(newurl).netloc:
            redirected.remove_header('Authorization')
        return redirected


opener = build_opener(SafeRedirect())


def github(path, raw=False):
    url = path if path.startswith('https://') else f'https://api.github.com/repos/{REPO}{path}'
    req = Request(url, headers={
        'Authorization': f'Bearer {TOKEN}',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': '3D-game-starter-preview'
    })
    with opener.open(req, timeout=35) as response:
        data = response.read(MAX_PREVIEW_BYTES + 4_000_000)
    if len(data) > MAX_PREVIEW_BYTES and raw:
        raise ValueError('Artifact is too large')
    return data if raw else json.loads(data)


def safely_extract(blob, dest, expected_pr, expected_sha):
    total = 0
    count = 0
    dest.mkdir(parents=True, exist_ok=True)
    with ZipFile(io.BytesIO(blob)) as zf:
        for entry in zf.infolist():
            if entry.is_dir():
                continue
            name = entry.filename
            relative = Path(name)
            if relative.is_absolute() or '..' in relative.parts or '\\' in name:
                raise ValueError(f'Unsafe artifact path: {name}')
            if stat.S_ISLNK(entry.external_attr >> 16):
                raise ValueError(f'Artifact contains symbolic link: {name}')
            if entry.file_size > MAX_FILE_BYTES:
                raise ValueError('Preview file too large')
            total += entry.file_size
            count += 1
            if total > MAX_PREVIEW_BYTES or count > 2500:
                raise ValueError('Preview uncompressed size exceeds safe limit')
            target = dest.joinpath(relative)
            if not target.resolve().is_relative_to(dest.resolve()):
                raise ValueError(f'Artifact escaped output path: {name}')
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(entry) as source, target.open('wb') as output:
                shutil.copyfileobj(source, output)
    manifest = json.loads((dest / '.preview-info.json').read_text('utf-8'))
    if manifest != {'pr': expected_pr, 'head_sha': expected_sha}:
        raise ValueError('Preview was built for a different PR commit')
    if not (dest / 'index.html').is_file():
        raise ValueError('Preview has no index.html')


def main():
    if not REPO or not TOKEN or not (ROOT / 'dist/index.html').is_file():
        sys.exit('Missing repo, token or built main site')
    if SITE.exists():
        shutil.rmtree(SITE)
    shutil.copytree(ROOT / 'dist', SITE)
    (SITE / '.nojekyll').touch()
    api_prs = github('/pulls?state=open&per_page=100')
    prs = [p for p in api_prs if p['head']['repo'] and p['head']['repo']['full_name'] == REPO]
    if len(prs) > MAX_PRS:
        print(f'{len(prs)} open PRs; showing first {MAX_PRS}; adjust MAX_PRS when needed')
    prs = prs[:MAX_PRS]
    if not prs:
        print('Production only: no open same-repository PRs')
        return

    runs = github('/actions/workflows/pr-checks.yml/runs?event=pull_request&per_page=100').get('workflow_runs', [])
    event_path = os.environ.get('GITHUB_EVENT_PATH')
    event = json.loads(Path(event_path).read_text()) if event_path else {}
    trigger = event.get('workflow_run', {})
    expected = set()
    if trigger.get('conclusion') == 'success':
        associated = {p['number'] for p in trigger.get('pull_requests', [])}
        expected = {p['number'] for p in prs if p['number'] in associated and p['head']['sha'] == trigger.get('head_sha')}
    manifest_urls = []
    for pr in prs:
        n, sha = pr['number'], pr['head']['sha']
        candidates = [r for r in runs if any(p.get('number') == n for p in r.get('pull_requests', []))]
        # Latest run matters: never show stale preview after a failing update.
        candidates.sort(key=lambda r: r['id'], reverse=True)
        if not candidates or candidates[0].get('conclusion') != 'success':
            print(f'PR #{n}: no successful current build (yet)')
            continue
        run = candidates[0]
        try:
            artifacts = github(f"/actions/runs/{run['id']}/artifacts?per_page=100")['artifacts']
            matched = next(a for a in artifacts if a['name'] == f'preview-pr-{n}' and not a['expired'])
            blob = github(matched['archive_download_url'], raw=True)
            folder = SITE / 'pr-preview' / f'pr-{n}'
            try:
                safely_extract(blob, folder, n, sha)
            except Exception:
                shutil.rmtree(folder, ignore_errors=True)
                raise
            manifest_urls.append(n)
        except Exception as exc:
            print(f'::warning::PR #{n}: unavailable or invalid preview: {exc}')
    print('Ready previews:', manifest_urls)
    missing = expected - set(manifest_urls)
    if missing:
        # Do not report a green deployment after silently omitting the triggering PR.
        raise RuntimeError(f'Current successful PR build has no valid preview: {sorted(missing)}')


if __name__ == '__main__':
    main()
