import yaml, json
import sys, os.path, codecs
import argparse
import subprocess


def is_yml_file(yml_filename):
    (_, ext) = os.path.splitext(yml_filename)
    return ext in [".yml", ".yaml"]

def title_if_included(convo, include_title):
    title = convo['title']
    if include_title == 'y' or (include_title == "___" and title.find("___") > -1):
        return convo['title'] + '\n'
    else:
        return ""

def yml_file_to_obj(yml_file):
    if not is_yml_file(yml_file):
        sys.exit("incorrect filetype supplied: .yml needed")
    (fname, ext) = os.path.splitext(yml_file)
    return yaml.load(open(yml_file, 'r'))

def get_transcript_txt(yml_file, include_title):
    yml_obj = yml_file_to_obj(yml_file)
    transcript = ""
    for convo in yml_obj['conversations']:
        transcript = transcript + title_if_included(convo, include_title)
        transcript = transcript + "\n".join(convo['conversation']) + '\n\n'
    return transcript

def yml_file_to_aligned_json_filename(yml_file):
    (fname, ext) = os.path.splitext(yml_file)
    return fname + '_aligned.json'

def yml_file_to_practica_json_filename(yml_file):
    (fname, ext) = os.path.splitext(yml_file)
    return fname + '_output.json'

def get_gentle_alignment(yml_file, audio_file, include_title):
    url = 'http://localhost:8765/transcriptions?async=false'
    outfile = yml_file_to_aligned_json_filename(yml_file)
    (fname, ext) = os.path.splitext(yml_file)
    txt_file = fname + '_transcript.txt'
    res = subprocess.call(
            ['curl',
             '-o', outfile,
             '-X', 'POST',
             '-F', 'audio=@%s' % (audio_file),
             '-F', 'transcript=<%s' % (txt_file),
             url])
    print res

def get_practica_json(yml_file, include_title):
    script_obj = yml_file_to_obj(yml_file)
    aligned = json.loads(open(yml_file_to_aligned_json_filename(yml_file), 'r').read())
    aWords = aligned['words']
    aIndex = 0
    def get_line_with_audio(aIndex, line):
        lineObj = {"text": line}
        line = line.replace("-", " ")
        line = line.replace("...", " ")
        for widx, word in enumerate(line.split(" ")):
            aWord = aWords[aIndex]
            # if alignedWord is part of this
            if word.find(aWord.get('word')) > -1:
                startmin = min(aWord.get('start'), lineObj.get('start', 99999999))
                endmax = max(aWord.get('end'), lineObj.get('end', 0))
                if startmin is not None:
                    lineObj['start'] = startmin
                if endmax is not None:
                    lineObj['end'] = endmax
                aIndex = aIndex + 1
            else:
                print word, " not found "
        lineObj['audioStart'] = lineObj['start'] * 1000
        lineObj['audioEnd'] = lineObj['end'] * 1000
        del lineObj['start']
        del lineObj['end']
        return (aIndex, lineObj)

    for cidx, convo in enumerate(script_obj['conversations']):
        if include_title == "y":
            (aIndex, titleObj) = get_line_with_audio(aIndex, convo['title'])
            convo['title'] = titleObj
        lines = convo['conversation']
        lineObjs = []
        for lidx, line in enumerate(lines):
            (aIndex, lineObj) = get_line_with_audio(aIndex, line)
            lineObjs.append(lineObj)
        script_obj['conversations'][cidx]['conversation'] = lineObjs
    with open(yml_file_to_practica_json_filename(yml_file), 'w') as jsonfile:
        jsonfile.write(json.dumps(script_obj, indent=2))

def yml_file_to_json_and_txt(yml_file, include_title):
    (fname, ext) = os.path.splitext(yml_file)
    obj = yml_file_to_obj(yml_file)
    ## WRITE .json version of .yml (for script-aligner.js)
    with open(fname + '.json', 'w') as jsonfile:
        jsonfile.write(json.dumps(obj, indent=2))
    ## WRITE .txt version of .yml (for gentle)
    with codecs.open(fname + '_transcript.txt', 'w', 'utf-8-sig') as txtfile:
        txtfile.write(get_transcript_txt(yml_file, include_title))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--yml", help="yml file to process directly.")
    group.add_argument("--dir", help="directory to crawl for yml files.")
    parser.add_argument("--title_recorded", choices=set(("y", "n", "___")),
            required=True,
            help="tell us if the title was re-recorded. Options are:\n" +
                 "y: yes, n: no, ___: only when title has ___ in it."),
    parser.add_argument("--transcribe", help="pass if you want to hit gentle.")
    parser.add_argument("--audio_file", help="pass if you want to hit gentle.")
    args = parser.parse_args()
    if args.yml:
        yml_file_to_json_and_txt(args.yml, args.title_recorded)
    if args.yml and args.transcribe and args.audio_file:
        get_gentle_alignment(args.yml, args.audio_file, args.title_recorded)
        get_practica_json(args.yml, args.title_recorded)
    elif args.dir and os.path.isdir(args.dir):
        for root, dirs, files in os.walk(args.dir):
            yml_files = filter(is_yml_file, files)
            for yml_file in yml_files:
                yml_file_to_json_and_txt(os.path.join(root, yml_file), args.title_recorded)
    else:
        parser.print_help()
        sys.exit("Either directory of yml file needs to be specified.")

