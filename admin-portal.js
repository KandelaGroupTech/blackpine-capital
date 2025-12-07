// Admin Portal JavaScript
let currentUser = null;
let allInvestors = [];

// Check authentication and admin status
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }

    const adminCheck = await isAdmin(user);
    if (!adminCheck) {
        await auth.signOut();
        window.location.href = 'admin-login.html';
        return;
    }

    currentUser = user;
    initializeDashboard();
});

// Initialize dashboard
async function initializeDashboard() {
    loadStatistics();
    loadInvestors();
    loadDocumentsList();
    setupTabSwitching();
    setupForms();
    setupFileUpload();
}

// Load statistics
function loadStatistics() {
    // Count investors
    db.collection('investors').onSnapshot((snapshot) => {
        document.getElementById('totalInvestors').textContent = snapshot.size;
    });

    // Count messages
    db.collection('messages').onSnapshot((snapshot) => {
        document.getElementById('totalMessages').textContent = snapshot.size;
    });

    // Count documents
    db.collection('documents').onSnapshot((snapshot) => {
        document.getElementById('totalDocuments').textContent = snapshot.size;
    });
}

// Load investors
function loadInvestors() {
    const container = document.getElementById('investorListContainer');
    const recipientSelects = [
        document.getElementById('messageRecipient'),
        document.getElementById('documentRecipient')
    ];

    db.collection('investors').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        allInvestors = [];

        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>No investors yet</p></div>';
            return;
        }

        let html = '';
        snapshot.forEach((doc) => {
            const investor = doc.data();
            allInvestors.push({ id: doc.id, ...investor });

            const lastLogin = investor.lastLogin
                ? investor.lastLogin.toDate().toLocaleDateString()
                : 'Never';

            html += `
                <div class="investor-item">
                    <div class="investor-info">
                        <div class="investor-name">${investor.name}</div>
                        <div class="investor-email">${investor.email} • Last login: ${lastLogin}</div>
                    </div>
                    <div class="investor-actions">
                        <button class="btn-small btn-secondary" onclick="resetInvestorPassword('${doc.id}', '${investor.email}')">Reset Password</button>
                        <button class="btn-small btn-danger" onclick="deleteInvestor('${doc.id}', '${investor.name}')">Remove</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Update recipient dropdowns
        recipientSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="all">All Investors</option>';

            allInvestors.forEach(investor => {
                const option = document.createElement('option');
                option.value = investor.id;
                option.textContent = investor.name;
                select.appendChild(option);
            });

            select.value = currentValue;
        });
    });
}

// Add investor
document.getElementById('addInvestorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('addInvestorBtn');
    const name = document.getElementById('investorName').value;
    const email = document.getElementById('investorEmail').value;
    const password = document.getElementById('investorPassword').value;

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;

        // Add to investors collection
        await db.collection('investors').doc(newUser.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: null
        });
        // Send welcome message to investor
        await db.collection('messages').add({
            recipientId: newUser.uid,
            subject: 'Welcome to Blackpine Capital Investor Portal',
            body: `Dear ${name},\n\nWelcome to the Blackpine Capital Investor Portal! Your account has been created successfully.\n\nYou can now log in to access:\n• Important messages and updates\n• Tax forms and financial statements\n• Quarterly reports and documents\n\nYour login email: ${email}\n\nFor security, we recommend changing your password after your first login. You can do this by clicking "Forgot Password" on the login page.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nBlackpine Capital Team`,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            sentBy: currentUser.uid,
            readAt: null
        });
        // Send password reset email so they can set their own password
        try {
            await auth.sendPasswordResetEmail(email);

            // Option B: Sign out admin to prevent session conflicts
            await auth.signOut();
            alert(`Investor ${name} added successfully!\n\nA welcome email with password reset instructions has been sent to ${email}.\n\nTemporary Password: ${password}\n\nThe investor can either:\n1. Use the temporary password to log in immediately\n2. Click the password reset link in their email to set a new password\n\nA welcome message has also been added to their dashboard.\n\nYou have been logged out for security. Please log back in.`);
            window.location.href = 'admin-login.html';
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);

            // Option B: Sign out admin to prevent session conflicts
            await auth.signOut();
            alert(`Investor ${name} added successfully!\n\nNote: Could not send password reset email. Please share these credentials manually:\n\nEmail: ${email}\nTemporary Password: ${password}\n\nA welcome message has been added to their dashboard.\n\nYou have been logged out for security. Please log back in.`);
            window.location.href = 'admin-login.html';
        }

        // Form reset and password generation removed - page will redirect to login
    } catch (error) {
        console.error('Error adding investor:', error);
        let errorMsg = 'Failed to add investor. ';

        if (error.code === 'auth/email-already-in-use') {
            errorMsg += 'This email is already registered.';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg += 'Invalid email address.';
        } else {
            errorMsg += error.message;
        }

        alert(errorMsg);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add Investor';
    }
});

// Generate random password
function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Initialize with a random password
document.getElementById('investorPassword').value = generatePassword();

// Reset investor password
async function resetInvestorPassword(investorId, email) {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent successfully!');
    } catch (error) {
        console.error('Error sending password reset:', error);
        alert('Failed to send password reset email. Please try again.');
    }
}

// Delete investor
async function deleteInvestor(investorId, name) {
    if (!confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) return;

    try {
        // Delete from Firestore
        await db.collection('investors').doc(investorId).delete();

        // Note: Deleting from Firebase Auth requires Admin SDK (server-side)
        // For now, we'll just remove from Firestore
        alert(`${name} removed from investor list. Note: The authentication account still exists and should be deleted from Firebase Console > Authentication.`);
    } catch (error) {
        console.error('Error deleting investor:', error);
        alert('Failed to remove investor. Please try again.');
    }
}

// Send message
document.getElementById('sendMessageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('sendMessageBtn');
    const recipient = document.getElementById('messageRecipient').value;
    const subject = document.getElementById('messageSubject').value;
    const body = document.getElementById('messageBody').value;
    const attachmentInput = document.getElementById('messageAttachment');
    const attachmentFile = attachmentInput.files[0];

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        let attachmentUrl = null;
        let attachmentName = null;
        let attachmentSize = null;

        // Upload attachment if present
        if (attachmentFile) {
            btn.textContent = 'Uploading attachment...';
            const timestamp = Date.now();
            const filename = `${timestamp}_${attachmentFile.name}`;
            const storageRef = storage.ref(`message-attachments/${filename}`);

            await storageRef.put(attachmentFile);
            attachmentUrl = await storageRef.getDownloadURL();
            attachmentName = attachmentFile.name;
            attachmentSize = attachmentFile.size;
        }

        btn.textContent = 'Sending message...';

        // Create message with optional attachment
        const messageData = {
            recipientId: recipient,
            subject: subject,
            body: body,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            sentBy: currentUser.uid,
            readAt: null
        };

        // Add attachment data if present
        if (attachmentUrl) {
            messageData.attachmentUrl = attachmentUrl;
            messageData.attachmentName = attachmentName;
            messageData.attachmentSize = attachmentSize;
        }

        await db.collection('messages').add(messageData);

        alert('Message sent successfully!');
        document.getElementById('sendMessageForm').reset();
        document.getElementById('messageFileInfo').style.display = 'none';
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
    }
});

// File upload setup
function setupFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('documentFile');
    const fileInfo = document.getElementById('fileInfo');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            displayFileInfo(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            displayFileInfo(file);
        }
    });
}

function displayFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const size = formatFileSize(file.size);
    fileInfo.innerHTML = `Selected: <strong>${file.name}</strong> (${size})`;
    fileInfo.style.display = 'block';
}

// Upload document
document.getElementById('uploadDocumentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('uploadDocumentBtn');
    const fileInput = document.getElementById('documentFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const recipient = document.getElementById('documentRecipient').value;
    const category = document.getElementById('documentCategory').value;

    btn.disabled = true;
    btn.textContent = 'Uploading...';

    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    uploadProgress.style.display = 'block';

    try {
        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = storage.ref(`documents/${filename}`);

        // Upload file with progress tracking
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressFill.style.width = progress + '%';
                progressText.textContent = `Uploading... ${Math.round(progress)}%`;
            },
            (error) => {
                console.error('Upload error:', error);
                alert('Failed to upload document. Please try again.');
                uploadProgress.style.display = 'none';
                btn.disabled = false;
                btn.textContent = 'Upload Document';
            },
            async () => {
                // Upload complete
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

                // Add document metadata to Firestore
                await db.collection('documents').add({
                    name: file.name,
                    category: category,
                    recipientId: recipient,
                    storageUrl: downloadURL,
                    fileSize: file.size,
                    fileType: file.type,
                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    uploadedBy: currentUser.uid
                });

                alert('Document uploaded successfully!');
                document.getElementById('uploadDocumentForm').reset();
                document.getElementById('fileInfo').style.display = 'none';
                uploadProgress.style.display = 'none';
                progressFill.style.width = '0%';
                btn.disabled = false;
                btn.textContent = 'Upload Document';
            }
        );
    } catch (error) {
        console.error('Error uploading document:', error);
        alert('Failed to upload document. Please try again.');
        uploadProgress.style.display = 'none';
        btn.disabled = false;
        btn.textContent = 'Upload Document';
    }
});

// Load documents list
function loadDocumentsList() {
    const container = document.getElementById('documentsListContainer');

    db.collection('documents').orderBy('uploadedAt', 'desc').onSnapshot((snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>No documents uploaded yet</p></div>';
            return;
        }

        let html = '';
        snapshot.forEach((doc) => {
            const document = doc.data();
            const date = document.uploadedAt ? document.uploadedAt.toDate().toLocaleDateString() : 'Recent';
            const size = formatFileSize(document.fileSize);
            const recipientName = document.recipientId === 'all' ? 'All Investors' :
                (allInvestors.find(inv => inv.id === document.recipientId)?.name || 'Unknown');

            html += `
                <div class="document-item">
                    <div class="document-header">
                        <div class="document-name">${document.name}</div>
                        <div class="document-date">${date}</div>
                    </div>
                    <div class="document-info">
                        <span class="document-category">${formatCategory(document.category)}</span>
                        <span>${size}</span>
                        <span>Shared with: ${recipientName}</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <button class="btn-small btn-danger" onclick="deleteDocument('${doc.id}', '${document.storageUrl}', '${document.name}')">Delete</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    });
}

// Delete document
async function deleteDocument(docId, storageUrl, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
        // Delete from Storage
        const storageRef = storage.refFromURL(storageUrl);
        await storageRef.delete();

        // Delete from Firestore
        await db.collection('documents').doc(docId).delete();

        alert('Document deleted successfully!');
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
    }
}

// Tab switching
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Setup forms
function setupForms() {
    // Forms are set up via event listeners above
}

// Utility functions
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatCategory(category) {
    const categories = {
        'tax-forms': 'Tax Forms',
        'financial-statements': 'Financial Statements',
        'other': 'Other'
    };
    return categories[category] || category;
}

// Setup message attachment file upload
const messageUploadArea = document.getElementById('messageFileUploadArea');
const messageFileInput = document.getElementById('messageAttachment');
const messageFileInfo = document.getElementById('messageFileInfo');

if (messageUploadArea && messageFileInput) {
    messageUploadArea.addEventListener('click', () => messageFileInput.click());

    messageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const size = formatFileSize(file.size);
            messageFileInfo.innerHTML = `Selected: <strong>${file.name}</strong> (${size})`;
            messageFileInfo.style.display = 'block';
        }
    });

    // Drag and drop
    messageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        messageUploadArea.classList.add('dragover');
    });

    messageUploadArea.addEventListener('dragleave', () => {
        messageUploadArea.classList.remove('dragover');
    });

    messageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        messageUploadArea.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file) {
            messageFileInput.files = e.dataTransfer.files;
            const size = formatFileSize(file.size);
            messageFileInfo.innerHTML = `Selected: <strong>${file.name}</strong> (${size})`;
            messageFileInfo.style.display = 'block';
        }
    });
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to sign out. Please try again.');
    }
});
