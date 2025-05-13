# Navigate to frontend and start the dev server in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Navigate to Backend\CRUD server and start it in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'Backend\CRUD server'; npm start"

# Navigate to Backend\notification server and start it in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'Backend\notification server'; npm start"

# Navigate to Backend\RealTimeCommunication Server server and start it in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command","cd 'Backend\RealTimeCommunication Server'; npm start"

# Navigate to root directory and start it in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command","peerjs --port 9000 --key peerjs --path /myapp"

