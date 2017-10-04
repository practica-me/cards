import yaml
import sys
import os.path
import json
import codecs

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print "Usage: \n python ingest_yaml.py foo.yml"
        sys.exit()
    fname = sys.argv[1]
    fname_only = os.path.splitext(fname)[0]
    obj = yaml.load(open(sys.argv[1], 'r'))
    with open(fname_only + '.json', 'w') as jsonfile:
        jsonfile.write(json.dumps(obj, indent=2))
    with codecs.open(fname_only + '_transcript.txt', 'w', 'utf-8-sig') as txtfile:
        transcript = ""
        for convo in obj['conversations']:
            transcript = transcript + convo['title'] + '\n'
            transcript = transcript + "\n".join(convo['conversation']) + '\n\n'
        txtfile.write(transcript)
