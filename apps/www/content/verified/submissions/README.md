# Submit a scorecard

Run `npx @ballmac/cli verify <your registry> --out scorecard.json`, name the file after your registry (`acme.json`), and open a pull request adding it here.

A scorecard is listed when:

- it parses, and its score follows from its checks (the test in `apps/www/tests/verified.test.ts` checks this);
- `registry.source` is a public `https://` address, so anyone can run the same command and get the same score;
- it is from your own registry.

We re-run the command on the registry before merging. To update an entry, open a pull request that replaces the file.
