import urllib.request
import json
import gzip
import io

def get_logs():
    url = 'https://api.github.com/repos/Explodingding/cinernet/actions/runs'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            runs = data.get('workflow_runs', [])
            if runs:
                latest = runs[0]
                jobs_url = latest['jobs_url']
                req2 = urllib.request.Request(jobs_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req2) as resp2:
                    jobs_data = json.loads(resp2.read())
                    for job in jobs_data.get('jobs', []):
                        if job['status'] == 'completed' and job['conclusion'] == 'failure':
                            # The job log URL requires authorization even for public repos if using the API, 
                            # but we can try scraping the HTML page of the run!
                            print(f"Run HTML: {job['html_url']}")
                            
                            # Let's try grabbing the logs directly from the API endpoint
                            # https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2022-11-28#download-job-logs-for-a-workflow-run
                            # Note: it redirects to a signed URL
                            log_url = f"https://api.github.com/repos/Explodingding/cinernet/actions/jobs/{job['id']}/logs"
                            print(f"Attempting to fetch logs from: {log_url}")
                            req3 = urllib.request.Request(log_url, headers={'User-Agent': 'Mozilla/5.0'})
                            try:
                                with urllib.request.urlopen(req3) as resp3:
                                    logs = resp3.read().decode('utf-8')
                                    lines = logs.split('\n')
                                    # print only lines containing 'error' or 'Type error'
                                    for i, line in enumerate(lines):
                                        if 'Type error' in line or 'Failed to type check' in line or 'error TS' in line:
                                            start = max(0, i-5)
                                            end = min(len(lines), i+15)
                                            print('\n'.join(lines[start:end]))
                                            return
                                    print("Could not find 'Type error' in logs. Printing last 50 lines:")
                                    print('\n'.join(lines[-50:]))
                            except urllib.error.HTTPError as he:
                                print(f"HTTP Error fetching logs (might need token): {he.code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    get_logs()
