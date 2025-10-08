"""
A custom function to fetch lab member data from the database (currently JSON) 
and update content/members.html every academic semester.

Environment variables:
- members_db_path: relative path to fetch JSON from (default to static/members.json)
- GIT_NAME, GIT_EMAIL: identity for commits

The desired format is a list with the following fields for each member:
- name (str)
- position (str)
- category (str) e.g., "PhD Students", "Postdocs", "Undergraduates"
- project (optional str)
- email (optional str)
- image (optional str) relative to /images/members/

Written by Amin Akhshi, 2025
"""
import os
import sys
import json
import argparse
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from html import escape

ROOT = os.path.dirname(os.path.dirname(__file__))
MEMBERS_FILE = os.path.join(ROOT, 'content', 'members.html')

START_MARKER = '<!-- MEMBERS_AUTOGEN_START -->'
END_MARKER = '<!-- MEMBERS_AUTOGEN_END -->'

FORMER_START = '<!-- FORMER_MEMBERS_AUTOGEN_START -->'
FORMER_END = '<!-- FORMER_MEMBERS_AUTOGEN_END -->'

DEFAULT_JSON = os.path.join(ROOT, 'static', 'members.json')


def fetch_json(url_or_path):
    # support file://, http(s), or local path
    if url_or_path.startswith('http://') or url_or_path.startswith('https://'):
        req = Request(url_or_path, headers={"User-Agent": "khadra-update-script/1.0"})
        try:
            with urlopen(req) as r:
                return json.load(r)
        except (HTTPError, URLError) as e:
            print('Failed to fetch JSON:', e, file=sys.stderr)
            raise
    else:
        # local file path
        with open(url_or_path, 'r', encoding='utf-8') as f:
            return json.load(f)


def group_members(members):
    groups = {}
    for m in members:
        cat = m.get('category', 'Other')
        groups.setdefault(cat, []).append(m)
    # preferred order
    order = [
        'Visiting Scholars and Postdoctoral Fellows',
        'PhD Students',
        "Master's Students",
        'Undergraduate Students',
        'Other'
    ]
    ordered = {k: groups[k] for k in order if k in groups}
    for k in groups:
        if k not in ordered:
            ordered[k] = groups[k]
    return ordered


def render_member_card(m):
    parts = []
    parts.append('            <div class="member-card" data-aos="fade-up">')
    if m.get('image'):
        img = escape(m['image'])
        parts.append('                <div class="member-image">')
        parts.append(f'                    <img src="/images/members/{img}" alt="{escape(m.get("name",""))}">')
        parts.append('                </div>')
    parts.append('                <div class="member-info">')
    parts.append(f'                    <h4>{escape(m.get("name",""))}</h4>')
    if m.get('position'):
        parts.append(f'                    <p class="member-position">{escape(m.get("position"))}</p>')
    if m.get('project'):
        parts.append(f'                    <p class="member-project">Research Focus: {escape(m.get("project"))}</p>')
    if m.get('email'):
        parts.append(f'                    <p class="member-email">{escape(m.get("email"))}</p>')
    parts.append('                </div>')
    parts.append('            </div>')
    return '\n'.join(parts)


def build_autogen_section(members, title='Current Lab Members'):
    grouped = group_members(members)
    out = []
    out.append('    <div class="container">')
    out.append('        <div class="section-header">')
    out.append(f'            <h2>{escape(title)}</h2>')
    out.append('        </div>')
    for category, items in grouped.items():
        icon = 'fas fa-users'
        if 'PhD' in category or 'Graduate' in category:
            icon = 'fas fa-graduation-cap'
        elif 'Postdoctoral' in category or 'Postdoc' in category or 'Visiting' in category:
            icon = 'fas fa-microscope'
        elif 'Undergrad' in category or 'Undergraduate' in category:
            icon = 'fas fa-users'
        elif "Master" in category:
            icon = 'fas fa-user-graduate'
        out.append(f'        <!-- {escape(category)} -->')
        out.append(f'        <h3 class="member-category-title" data-aos="fade-up"><i class="{icon}"></i> {escape(category)}</h3>')
        out.append('        <div class="members-grid">')
        for m in items:
            out.append(render_member_card(m))
        out.append('        </div>')
        out.append('        ')
    out.append('    </div>')
    return '\n'.join(out)


def build_former_section(former_members):
    # former_members: list of {name, note, category}
    groups = {}
    for m in former_members:
        cat = m.get('category', 'Former')
        groups.setdefault(cat, []).append(m)

    out = []
    out.append('    <div class="container">')
    out.append('        <div class="section-header">')
    out.append('            <h2>Former Lab Members</h2>')
    out.append('        </div>')

    for category, items in groups.items():
        out.append(f'        <div class="card" data-aos="fade-up">')
        out.append(f'            <h3>{escape(category)}</h3>')
        out.append('            <ul class="members-list">')
        for m in items:
            name = escape(m.get('name', ''))
            note = escape(m.get('note', ''))
            if note:
                out.append(f'                <li><strong>{name}</strong> – {note}</li>')
            else:
                out.append(f'                <li><strong>{name}</strong></li>')
        out.append('            </ul>')
        out.append('        </div>')

    out.append('    </div>')
    return '\n'.join(out)


def replace_section(file_text, start_marker, end_marker, new_section):
    if start_marker not in file_text or end_marker not in file_text:
        raise RuntimeError(f'Markers {start_marker} or {end_marker} not found in members.html')
    before, rest = file_text.split(start_marker, 1)
    middle, after = rest.split(end_marker, 1)
    new_text = before + start_marker + '\n' + new_section + '\n' + end_marker + after
    return new_text


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default=os.environ.get('members_db_path', ''), help='JSON URL or local path')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()


    source = args.source or os.environ.get('members_db_path') or DEFAULT_JSON

    try:
        data = fetch_json(source)
    except Exception as e:
        print('Error fetching members JSON:', e, file=sys.stderr)
        sys.exit(1)

    # support two shapes: list (legacy) -> current; or object with 'current' and 'former'
    if isinstance(data, list):
        current = data
        former = []
    elif isinstance(data, dict):
        current = data.get('current', [])
        former = data.get('former', [])
    else:
        print('Unexpected JSON format for members', file=sys.stderr)
        sys.exit(1)

    new_current_section = build_autogen_section(current, title='Current Lab Members')
    new_former_section = build_former_section(former)

    with open(MEMBERS_FILE, 'r', encoding='utf-8') as f:
        orig = f.read()

    try:
        updated = replace_section(orig, START_MARKER, END_MARKER, new_current_section)
        updated = replace_section(updated, FORMER_START, FORMER_END, new_former_section)
    except RuntimeError as e:
        print(e, file=sys.stderr)
        sys.exit(1)

    if updated == orig:
        print('No changes detected.')
        return

    if args.dry_run:
        print('--- updated file preview ---')
        print(updated)
        return

    # write back
    with open(MEMBERS_FILE, 'w', encoding='utf-8') as f:
        f.write(updated)

    print('members.html updated')
    # in CI, commit changes
    if os.environ.get('GITHUB_ACTIONS'):
        # configure git identity
        git_name = os.environ.get('GIT_NAME', 'github-actions[bot]')
        git_email = os.environ.get('GIT_EMAIL', 'actions@github.com')
        import subprocess
        subprocess.check_call(['git', 'config', 'user.name', git_name])
        subprocess.check_call(['git', 'config', 'user.email', git_email])
        subprocess.check_call(['git', 'add', MEMBERS_FILE])
        # only commit if changes
        try:
            subprocess.check_call(['git', 'commit', '-m', 'chore: update members (automated)'])
            # push using token provided by actions
            subprocess.check_call(['git', 'push'])
            print('Changes committed and pushed')
        except subprocess.CalledProcessError as e:
            print('Git commit/push failed or no changes to commit:', e, file=sys.stderr)


if __name__ == '__main__':
    main()
