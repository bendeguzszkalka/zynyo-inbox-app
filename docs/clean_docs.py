import os
import re
from html.parser import HTMLParser

class DocHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
        self.in_pre = False
        self.in_code = False
        self.href = None
        self.in_a = False
        self.a_text = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'p':
            self.fed.append('\n\n')
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            self.fed.append('\n\n' + '#' * level + ' ')
        elif tag == 'li':
            self.fed.append('\n* ')
        elif tag == 'pre':
            self.in_pre = True
            self.fed.append('\n\n```json\n')
        elif tag == 'code':
            self.in_code = True
            if not self.in_pre:
                self.fed.append('`')
        elif tag == 'a':
            self.in_a = True
            self.href = attrs_dict.get('href', '')
            self.a_text = []
        elif tag == 'br':
            self.fed.append('\n')

    def handle_endtag(self, tag):
        if tag in ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.fed.append('\n')
        elif tag == 'pre':
            self.in_pre = False
            self.fed.append('\n```\n\n')
        elif tag == 'code':
            self.in_code = False
            if not self.in_pre:
                self.fed.append('`')
        elif tag == 'a':
            self.in_a = False
            link_text = ''.join(self.a_text).strip()
            if link_text and not link_text.startswith('​'):
                self.fed.append(f' [{link_text}]({self.href}) ')
            self.href = None

    def handle_data(self, data):
        if self.in_a:
            self.a_text.append(data)
        else:
            if data == '​' or data.strip() == '​':
                return
            self.fed.append(data)

    def get_markdown(self):
        text = ''.join(self.fed)
        text = re.sub(r' +', ' ', text)
        text = re.sub(r'\n\n+', '\n\n', text)
        return text.strip()

def extract_article_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    start_tag = '<div class="theme-doc-markdown markdown">'
    end_tag = '</article>'
    
    start_idx = html_content.find(start_tag)
    end_idx = html_content.find(end_tag)
    
    if start_idx == -1 or end_idx == -1:
        start_tag = '<article>'
        start_idx = html_content.find(start_tag)
        
    if start_idx != -1 and end_idx != -1:
        html_fragment = html_content[start_idx:end_idx]
    else:
        html_fragment = html_content

    parser = DocHTMLParser()
    parser.feed(html_fragment)
    return parser.get_markdown()

def main():
    steps = {
        '1. Getting Started': '144',
        '2. Account Overview': '150',
        '   - Creating an Account': '174',
        '   - Obtaining an API-key': '176',
        '   - Obtaining an Access Token': '178',
        '3. eSign Options Overview': '152',
        '   - Creating a Basic Sign Request': '180',
        '   - Sign Request Options': '182',
        '   - Getting the Status of a Request': '184',
        '4. eDelivery Overview': '154',
        '   - Creating a Basic eDelivery': '186',
        '5. eSeal Details': '156',
        '6. Status Codes': '158'
    }

    base_dir = '/Users/bendeguz/.gemini/antigravity-ide/brain/7a0d7d71-3b33-489f-af24-f49b60b4d890/.system_generated/steps'
    output_path = '/Users/bendeguz/Documents/programming/ia-hackathon-2026/zynyo-inbox-app/docs/zynyo_api_docs.md'

    combined_markdown = '# Zynyo Core API Reference Documentation\n\n'
    combined_markdown += '> This document aggregates the Zynyo API documentation for easy access during development.\n\n---\n\n'

    for title, step_num in steps.items():
        file_path = os.path.join(base_dir, step_num, 'content.md')
        if os.path.exists(file_path):
            print(f'Processing {title}...')
            markdown_content = extract_article_content(file_path)
            combined_markdown += f'# {title.strip()}\n\n'
            combined_markdown += markdown_content
            combined_markdown += '\n\n---\n\n'
        else:
            print(f'Warning: {file_path} not found.')

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(combined_markdown)
    print(f'Documentation written successfully to {output_path}')

if __name__ == '__main__':
    main()
