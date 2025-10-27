from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import tempfile
import shutil
from ultralytics import YOLO
from scripts.utils import get_device, smooth_point, detect_up, detect_down, score_prediction
from scripts.shot_tracker import process_video
import json
from datetime import datetime
import os 
import time
#create fastapi instance
app = FastAPI(title="Basketball Shot Tracker API")
LOG_FILE = "shot_log.json"
#ensure output folder exists 
Path("outputs").mkdir(exist_ok=True)

#for a user, get their past shot tracking history to plot in a line chart
@app.get("/get_history")
def get_history():
    try:
        with open(LOG_FILE, "r") as f:
            data = json.load(f)
        return {"sessions": data}
    except:
        return {"sessions": data}


@app.get("/")
def home():
    return {"message": "Welcome to the Shot Tracker API"}

#when user wants to download annotated video 
@app.get("/download/{filename}")
def download_file(filename:str):
    #check if output filepath is true by extracting the filename protion in the url 
    output_file = Path(__file__).parent / "outputs" / f"processed_{filename}"
    if not output_file.exists():
        return {"error": "content not found"}
    def cleanup(path:Path):
        time.sleep(20)  # wait 10 seconds
        if os.path.exists(Path):
            os.remove(Path)
    background_tasks = BackgroundTasks()
    background_tasks.add_task(cleanup, output_file)
    return FileResponse(
        str(output_file),
        media_type="video/mp4",
        filename=f"processed_{filename}"
    )

#for asynch videos want to post to count shot atttempts user uploads videos through upload request
@app.post("/upload")
#get filename from upload file 
async def upload_video(file: UploadFile = File(...), draw: bool=False):
    """
    Endpoint for user to upload a video such as basektball clip
    The backend will process the video and return the labeled results.
    """

    #save upload to temp file 
    #because cannot directly pass the upload stream to opencv downlaod as mp4 file to read 
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    file.file.close() 
    #run tracking logic 
    output_path = f"outputs/processed_{file.filename}"
    #get results from processing 
    results = process_video(tmp_path, output_path=output_path, return_video=draw)
    #return the contents from the video analysis and provide the download irl 
    log_session(results["FGM"], results["FGA"])
    return JSONResponse(content={
        "message":f"Processed {file.filename}",
        "download_url": f"http://192.168.1.218:8000/download/{file.filename}",
        "FGM": results['FGM'],
        "FGA": results['FGA'],
        "FG_percent": round(results["FGM"] / results["FGA"], 2) * 100 if results["FGA"] > 0 else 0.0

    })

@app.get("/live")
def live_video():
    """
    Run shot tracking, but on live video 
    """
    #live videos no annotation 
    #get live session updates of shot counts 
    results = process_video()
    return JSONResponse(content={
        "message": "Live Video Tracking has Ended",
        "FGM": results.get("FGM", 0),
        "FGA": results.get("FGA", 0),
        "FG%": round(results["FGM"] / results["FGA"], 2) if results["FGA"] > 0 else 0.0
    })


def log_session(fgm, fga):
    try:
        with open(LOG_FILE, "r") as f:
            data = json.load(f)
            if isinstance(data, dict):
                data = [data]
    except FileNotFoundError:
        data = []
    data.append({
        "date": datetime.now().isoformat(),
        "FGM": fgm,
        "FGA": fga,
        "FG_percent": round(fgm / fga, 2) if fga > 0 else 0.0
                 })
    with open(LOG_FILE, "w") as f:
        json.dump(data, f, indent=4)

