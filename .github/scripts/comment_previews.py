"""Idempotently comment only on open PRs with an actually deployed preview."""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote

REPO=os.environ.get('GITHUB_REPOSITORY', '')
TOKEN=os.environ.get('GH_TOKEN', '')


def pages_url(repository):
    owner, repo = repository.split('/', 1)
    prefix = '' if repo.lower() == f'{owner.lower()}.github.io' else f'/{quote(repo)}'
    return f'https://{owner.lower()}.github.io{prefix}'


def api(url, body=None):
    url = url if url.startswith('https://') else f'https://api.github.com/repos/{REPO}{url}'
    data = None if body is None else json.dumps(body).encode('utf8')
    req=Request(url,data=data,headers={'Authorization':f'Bearer {TOKEN}', 'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'3D-game-starter'})
    with urlopen(req,timeout=30) as r:
        return json.load(r)


def main():
    if not REPO or not TOKEN: return
    for pr in api('/pulls?state=open&per_page=100'):
        n=pr['number']
        if not (Path('site')/'pr-preview'/f'pr-{n}'/'index.html').is_file(): continue
        marker=f'<!-- 3d-starter-preview-pr-{n} -->'
        try:
            comments=api(f'/issues/{n}/comments?per_page=100')
            if any(marker in c.get('body','') for c in comments): continue
            link=f'{pages_url(REPO)}/pr-preview/pr-{n}/'
            api(f'/issues/{n}/comments', {'body':f'{marker}\n**3D-Vorschau:** {link}\n\nHier kannst du den aktuellen Entwicklungsstand vor dem Merge direkt im Browser testen. Die Vorschau ist öffentlich.'})
        except Exception as exc:
            # Missing optional comment permissions must not roll back a deployment.
            print(f'PR #{n}: preview link comment could not be posted: {exc}')


if __name__=='__main__': main()
