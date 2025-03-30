// WebRTC Configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Global Variables
let localStream = null;
let peerConnection = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

// Initialize WebRTC
async function initializeWebRTC() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        document.getElementById('localVideo').srcObject = localStream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Error accessing camera and microphone. Please ensure you have granted the necessary permissions.');
    }
}

// Sign Language Recognition
async function startSignRecognition() {
    const webcam = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcam.srcObject = stream;
        
        // TODO: Implement TensorFlow.js hand pose detection
        // This would involve loading the model and processing the video feed
        console.log('Sign language recognition started');
    } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Error accessing webcam. Please ensure you have granted camera permissions.');
    }
}

// Text to Sign Language Conversion
function convertTextToSign() {
    const text = document.getElementById('textInput').value;
    const language = document.getElementById('signLanguage').value;
    
    if (!text) {
        alert('Please enter text to convert');
        return;
    }
    
    // TODO: Implement text to sign language conversion
    // This would involve calling an API or using a pre-trained model
    console.log(`Converting text to ${language}:`, text);
}

// Speech Recognition
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = function(event) {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        // TODO: Convert speech to sign language
        console.log('Speech recognized:', transcript);
    };
}

// Speech Recording
document.getElementById('startRecording').addEventListener('click', function() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    if (!localStream) {
        alert('Please start the video call first');
        return;
    }
    
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(localStream);
    
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        // TODO: Process the recorded video for sign language recognition
        console.log('Recording saved:', url);
    };
    
    mediaRecorder.start();
    isRecording = true;
    this.textContent = 'Stop Recording';
    document.getElementById('recordingStatus').textContent = 'Recording...';
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        this.textContent = 'Start Recording';
        document.getElementById('recordingStatus').textContent = 'Recording stopped';
    }
}

// Video Call
document.getElementById('startCall').addEventListener('click', async function() {
    if (!localStream) {
        await initializeWebRTC();
    }
    
    // TODO: Implement peer connection setup
    console.log('Starting video call...');
});

document.getElementById('endCall').addEventListener('click', function() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
    console.log('Ending video call...');
});

// Chat Functionality
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <p>${message}</p>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // TODO: Implement message translation and delivery
    messageInput.value = '';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Initialize WebRTC when the page loads
    initializeWebRTC();
});

// Add keyboard support for chat
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Notepad functionality
function toggleNotepad() {
    const notepadContainer = document.getElementById('notepadContainer');
    notepadContainer.classList.toggle('active');
    
    // If opening the notepad, load saved notes
    if (notepadContainer.classList.contains('active')) {
        loadNote();
    }
}

function saveNote() {
    const notepadText = document.getElementById('notepadText').value;
    localStorage.setItem('quickNotes', notepadText);
    
    // Show save confirmation
    const saveBtn = document.querySelector('.notepad-btn i.fa-save').parentElement;
    saveBtn.style.color = '#4caf50';
    setTimeout(() => {
        saveBtn.style.color = 'var(--white)';
    }, 1000);
}

function loadNote() {
    const savedNote = localStorage.getItem('quickNotes');
    if (savedNote) {
        document.getElementById('notepadText').value = savedNote;
    }
}

function clearNote() {
    if (confirm('Are you sure you want to clear all notes?')) {
        document.getElementById('notepadText').value = '';
        localStorage.removeItem('quickNotes');
        
        // Show clear confirmation
        const clearBtn = document.querySelector('.notepad-btn i.fa-trash').parentElement;
        clearBtn.style.color = '#f44336';
        setTimeout(() => {
            clearBtn.style.color = 'var(--white)';
        }, 1000);
    }
}

// Auto-save note when typing
document.getElementById('notepadText').addEventListener('input', () => {
    // Debounce the save operation
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveNote, 1000);
});

// Close notepad when clicking outside
document.addEventListener('click', (e) => {
    const notepadContainer = document.getElementById('notepadContainer');
    const notepadBtn = document.querySelector('.access-btn i.fa-sticky-note').parentElement;
    
    if (!notepadContainer.contains(e.target) && !notepadBtn.contains(e.target)) {
        notepadContainer.classList.remove('active');
    }
});

// Prevent notepad from closing when clicking inside it
document.getElementById('notepadContainer').addEventListener('click', (e) => {
    e.stopPropagation();
}); 