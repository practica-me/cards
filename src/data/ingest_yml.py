import yaml, json
import sys, os.path, codecs
import argparse


def is_yml_file(yml_filename):
    (_, ext) = os.path.splitext(yml_filename)
    return ext in [".yml", ".yaml"]

def process_yml_file(yml_file):
    if not is_yml_file(yml_file):
        sys.exit("incorrect filetype supplied: .yml needed")
    (fname, ext) = os.path.splitext(yml_file)
    obj = yaml.load(open(yml_file, 'r'))
    with open(fname + '.json', 'w') as jsonfile:
        jsonfile.write(json.dumps(obj, indent=2))
    with codecs.open(fname + '_transcript.txt', 'w', 'utf-8-sig') as txtfile:
        transcript = ""
        for convo in obj['conversations']:
            transcript = transcript + convo['title'] + '\n'
            transcript = transcript + "\n".join(convo['conversation']) + '\n\n'
        txtfile.write(transcript)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--yml", help="yml file to process directly.")
    parser.add_argument("--dir", help="directory to crawl for yml files.")
    args = parser.parse_args()
    if args.yml:
        process_yml_file(args.yml)
    elif args.dir and os.path.isdir(args.dir):
        for root, dirs, files in os.walk(args.dir):
            yml_files = filter(is_yml_file, files)
            for yml_file in yml_files:
                process_yml_file(os.path.join(root, yml_file))
    else:
        parser.print_help()
        sys.exit("Either directory of yml file needs to be specified.")

