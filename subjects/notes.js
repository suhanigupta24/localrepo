// Note management functionality
class NoteManager {
    constructor(subject) {
        this.subject = subject;
        this.notes = this.loadNotes();
    }

    loadNotes() {
        const savedNotes = localStorage.getItem(`notes_${this.subject}`);
        return savedNotes ? JSON.parse(savedNotes) : [];
    }

    saveNotes() {
        localStorage.setItem(`notes_${this.subject}`, JSON.stringify(this.notes));
    }

    addNote(title, description, file) {
        const note = {
            id: Date.now(),
            title,
            description,
            file: file ? {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            } : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.saveNotes();
        this.renderNotes();
        return note;
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        this.renderNotes();
    }

    downloadNote(id) {
        const note = this.notes.find(note => note.id === id);
        if (note && note.file) {
            // TODO: Implement file download
            console.log('Downloading note:', note);
        }
    }

    viewNote(id) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            // TODO: Implement note viewing
            console.log('Viewing note:', note);
        }
    }

    renderNotes() {
        const notesList = document.querySelector('.notes-list');
        if (!notesList) return;

        notesList.innerHTML = this.notes.map(note => `
            <div class="note-card" data-id="${note.id}">
                <div class="note-info">
                    <div class="note-title">${note.title}</div>
                    <div class="note-meta">Last updated: ${new Date(note.updatedAt).toLocaleDateString()}</div>
                </div>
                <div class="note-actions">
                    <button class="note-btn" title="View Note" onclick="noteManager.viewNote(${note.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="note-btn" title="Download" onclick="noteManager.downloadNote(${note.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="note-btn" title="Delete" onclick="noteManager.deleteNote(${note.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Initialize note manager based on current subject
const subject = window.location.pathname.split('/').pop().replace('.html', '');
const noteManager = new NoteManager(subject);

// File upload handling
const fileUpload = document.getElementById('fileUpload');
const fileInput = document.getElementById('fileInput');

fileUpload.addEventListener('click', () => {
    fileInput.click();
});

fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = 'var(--primary-color)';
    fileUpload.style.background = 'rgba(106, 27, 154, 0.05)';
});

fileUpload.addEventListener('dragleave', () => {
    fileUpload.style.borderColor = '#e0e0e0';
    fileUpload.style.background = 'transparent';
});

fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.style.borderColor = '#e0e0e0';
    fileUpload.style.background = 'transparent';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        // Store the file for later use
        window.selectedFile = file;
    }
}

// Form submission
document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('noteTitle').value;
    const description = document.getElementById('noteDescription').value;
    const file = window.selectedFile;

    if (title && (file || description)) {
        noteManager.addNote(title, description, file);
        e.target.reset();
        window.selectedFile = null;
    }
});

// Initial render
noteManager.renderNotes(); 