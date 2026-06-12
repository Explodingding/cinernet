import urllib.request
import json
import time

def check_latest_run():
    url = 'https://api.github.com/repos/Explodingding/cinernet/actions/runs'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            runs = data.get('workflow_runs', [])
            if runs:
                latest = runs[0]
                print(f"Latest run: {latest['name']} (ID: {latest['id']})")
                print(f"Status: {latest['status']}")
                print(f"Conclusion: {latest['conclusion']}")
                print(f"HTML URL: {latest['html_url']}")
                print(f"Head Commit Message: {latest['head_commit']['message']}")
                
                # If we want to check jobs
                jobs_url = latest['jobs_url']
                req2 = urllib.request.Request(jobs_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req2) as resp2:
                    jobs_data = json.loads(resp2.read())
                    for job in jobs_data.get('jobs', []):
                        if job['status'] == 'completed' and job['conclusion'] == 'failure':
                            print(f"\n[FAILED JOB] {job['name']}")
                            # To get exact log we would need to download the zip or hit logs API,
                            # but usually the conclusion is enough to know it failed.
            else:
                print('No runs found')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    check_latest_run()
