import argparse

def transform_text(txtfile):
    conversations = []
    conversation = {}
    with open(txtfile) as f:
        for line in f.readlines():
            line = line.rstrip('\n')
            if line = '---' and len(:
                conversations.append()



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Transform conversation text format to json.')
    parser.add_argument('--infile', help='txt file to transform', required=True)
    parser.add_argument('--outfile', help='json file out output', required=True)
    args = parser.parse_args()
    transform_text(args.infile)
