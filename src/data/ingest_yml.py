import yaml, json
import sys, os.path, codecs
import argparse


def is_yml_file(yml_filename):
    (_, ext) = os.path.splitext(yml_filename)
    return ext in [".yml", ".yaml"]

def title_if_included(convo, include_title):
    title = convo['title']
    if include_title == 'y' or (include_title == "___" and title.find("___") > -1):
        return convo['title'] + '\n'
    else:
        return ""

def process_yml_file(yml_file, include_title):
    if not is_yml_file(yml_file):
        sys.exit("incorrect filetype supplied: .yml needed")
    (fname, ext) = os.path.splitext(yml_file)
    obj = yaml.load(open(yml_file, 'r'))
    with open(fname + '.json', 'w') as jsonfile:
        jsonfile.write(json.dumps(obj, indent=2))
    with codecs.open(fname + '_transcript.txt', 'w', 'utf-8-sig') as txtfile:
        transcript = ""
        for convo in obj['conversations']:
            transcript = transcript + title_if_included(convo, include_title)
            transcript = transcript + "\n".join(convo['conversation']) + '\n\n'
        txtfile.write(transcript)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--yml", help="yml file to process directly.")
    group.add_argument("--dir", help="directory to crawl for yml files.")
    parser.add_argument("--title_recorded", choices=set(("y", "n", "___")),
            required=True,
            help="tell us if the title was re-recorded. Options are:\n" +
                 "y: yes, n: no, ___: only when title has ___ in it."),
    args = parser.parse_args()
    if args.yml:
        process_yml_file(args.yml, args.title_recorded)
    elif args.dir and os.path.isdir(args.dir):
        for root, dirs, files in os.walk(args.dir):
            yml_files = filter(is_yml_file, files)
            for yml_file in yml_files:
                process_yml_file(os.path.join(root, yml_file), args.title_recorded)
    else:
        parser.print_help()
        sys.exit("Either directory of yml file needs to be specified.")

