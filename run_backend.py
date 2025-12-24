import uvicorn
import os
import sys

# Add the current directory to sys.path to ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.main import app

if __name__ == "__main__":
    # Freeze support is needed for multiprocessing on Windows, though uvicorn usually doesn't use it in this config
    from multiprocessing import freeze_support
    freeze_support()
    
    uvicorn.run(app, host="127.0.0.1", port=8000)
