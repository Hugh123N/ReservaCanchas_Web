#!/usr/bin/env python3
"""
Sync Tailwind CSS v4 documentation from tailwindcss.com repository.
This script clones the docs and creates a local snapshot for agent use.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def main():
    # Check for --accept-docs-license flag
    if '--accept-docs-license' not in sys.argv:
        print("Error: You must accept the docs license to run this script.")
        print("Usage: python sync_tailwind_docs.py --accept-docs-license")
        print("\nThe Tailwind docs repo is source-available but not open-source.")
        print("By running this script, you accept the upstream license.")
        sys.exit(1)
    
    # Setup paths
    script_dir = Path(__file__).parent.parent
    references_dir = script_dir / "references"
    docs_dir = references_dir / "docs"
    temp_dir = script_dir / ".tailwind-docs-temp"
    
    print("Syncing Tailwind CSS v4 documentation...")
    print(f"Target directory: {docs_dir}")
    
    # Create references directory if it doesn't exist
    references_dir.mkdir(exist_ok=True)
    
    # Remove old docs if they exist
    if docs_dir.exists():
        print("Removing old docs snapshot...")
        shutil.rmtree(docs_dir)
    
    # Check if --local-repo is provided
    local_repo = None
    for i, arg in enumerate(sys.argv):
        if arg == '--local-repo' and i + 1 < len(sys.argv):
            local_repo = sys.argv[i + 1]
            break
    
    if local_repo and Path(local_repo).exists():
        print(f"Using local repo: {local_repo}")
        source_docs = Path(local_repo) / "src" / "docs"
        if source_docs.exists():
            shutil.copytree(source_docs, docs_dir)
        else:
            print(f"Error: {source_docs} does not exist")
            sys.exit(1)
    else:
        # Clone the repo
        print("Cloning tailwindcss.com repository...")
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        
        try:
            subprocess.run([
                "git", "clone", "--depth", "1",
                "https://github.com/tailwindlabs/tailwindcss.com.git",
                str(temp_dir)
            ], check=True, capture_output=True)
            
            # Copy docs
            source_docs = temp_dir / "src" / "docs"
            if source_docs.exists():
                shutil.copytree(source_docs, docs_dir)
            else:
                print(f"Error: {source_docs} does not exist in cloned repo")
                sys.exit(1)
                
        except subprocess.CalledProcessError as e:
            print(f"Error cloning repository: {e}")
            sys.exit(1)
        finally:
            # Cleanup temp directory
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
    
    # Generate docs index
    print("Generating docs index...")
    generate_docs_index(docs_dir, references_dir / "docs-index.tsx")
    
    # Record source info
    source_file = references_dir / "docs-source.txt"
    with open(source_file, 'w') as f:
        f.write(f"Source: tailwindlabs/tailwindcss.com\n")
        f.write(f"Snapshot date: {subprocess.run(['date', '/t'], capture_output=True, text=True).stdout.strip()}\n")
        f.write(f"Note: Manual snapshot - run this script periodically to update\n")
    
    print(f"\nDone! Documentation snapshot created at:")
    print(f"  - {docs_dir}")
    print(f"  - {references_dir / 'docs-index.tsx'}")
    print(f"\nNote: The Tailwind docs are source-available but not open-source.")
    print("Please respect the upstream license when using this documentation.")

def generate_docs_index(docs_dir: Path, output_file: Path):
    """Generate a simple index of available docs."""
    index_content = """// Auto-generated docs index
// Run sync_tailwind_docs.py to regenerate

export interface DocEntry {
  slug: string;
  title: string;
  category: string;
  filePath: string;
}

export const docsIndex: DocEntry[] = [
"""
    
    # Scan for MDX files
    for mdx_file in sorted(docs_dir.glob("**/*.mdx")):
        relative_path = mdx_file.relative_to(docs_dir)
        slug = str(relative_path).replace(".mdx", "").replace("\\", "/")
        category = relative_path.parts[0] if len(relative_path.parts) > 0 else "general"
        
        # Extract title from file (first # heading)
        title = slug.split("/")[-1].replace("-", " ").title()
        try:
            with open(mdx_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith("# "):
                        title = line[2:].strip()
                        break
        except:
            pass
        
        index_content += f'  {{ slug: "{slug}", title: "{title}", category: "{category}", filePath: "{relative_path}" }},\n'
    
    index_content += "];\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(index_content)

if __name__ == "__main__":
    main()
