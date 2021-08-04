import submission
from pathlib import Path

file = Path("C:/Users/andrewss/Desktop/example Pre-mixed.xlsx")

submission = submission.parse_submission(file,"")

print(submission)