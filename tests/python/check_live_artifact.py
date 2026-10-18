"""Integration check on GitHub using only actions:read; no deployment or writes."""
import importlib.util
import os
from pathlib import Path
import tempfile

script = Path(__file__).resolve().parents[2] / '.github/scripts/assemble_pages.py'
spec = importlib.util.spec_from_file_location('assemble_pages', script)
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)

if __name__ == '__main__':
    artifact_id = int(os.environ['PREVIEW_ARTIFACT_ID'])
    number = int(os.environ['PR_NUMBER'])
    sha = os.environ['PR_HEAD_SHA']
    blob = publisher.github(f'/actions/artifacts/{artifact_id}/zip', raw=True)
    with tempfile.TemporaryDirectory() as path:
        publisher.safely_extract(blob, Path(path), number, sha)
    print(f'Validated real artifact {artifact_id} for PR #{number} at {sha}')
