from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/get_list', methods=['GET'])
def get_list():
    # Define the directory path
    directory_path = '../../../'
    
    # Check if the directory exists
    if not os.path.exists(directory_path):
        return jsonify({'error': 'Directory not found'}), 404

    # List all items (files and directories) in the directory
    try:
        items = os.listdir(directory_path)
        return jsonify({'items': items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=1234, debug=True)
