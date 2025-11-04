document.addEventListener('DOMContentLoaded', function () {
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-primary d-lg-none position-absolute top-0 end-0 m-2';
            toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
            document.body.appendChild(toggleBtn);

            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && window.innerWidth < 992) {
                    sidebar.classList.remove('show');
                }
            });

            const transactionTime = document.getElementById('transactionTime');
            function updateTransactionTime() {
                const now = new Date();
                const options = {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta',
                    hour12: false
                };
                transactionTime.textContent = `Last Updated: ${now.toLocaleString('id-ID', options).replace('WIB', '')} WIB`;
            }
            updateTransactionTime();
            setInterval(updateTransactionTime, 60000);

            const saveSettingsBtn = document.getElementById('saveSettings');
            saveSettingsBtn.addEventListener('click', function () {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const washFoldPrice = document.getElementById('washFoldPrice').value;
                const dryCleaningPrice = document.getElementById('dryCleaningPrice').value;
                const ironingPrice = document.getElementById('ironingPrice').value;
                const emailNotify = document.getElementById('emailNotify').checked;
                const smsNotify = document.getElementById('smsNotify').checked;
                const waNotify = document.getElementById('waNotify').checked;

                if (!email || !email.includes('@')) {
                    alert('Please enter a valid email address.');
                    return;
                }
                if (password && password.length < 6) {
                    alert('Password must be at least 6 characters long.');
                    return;
                }
                if (washFoldPrice < 0 || dryCleaningPrice < 0 || ironingPrice < 0) {
                    alert('Service prices cannot be negative.');
                    return;
                }

                alert(`Settings saved!\n` +
                    `User Profile: Email=${email}, Password=${password ? 'Updated' : 'Not Changed'}\n` +
                    `Service Prices: Wash & Fold=$${washFoldPrice}, Dry Cleaning=$${dryCleaningPrice}, Ironing=$${ironingPrice}\n` +
                    `Notifications: Email=${emailNotify}, SMS=${smsNotify}, WhatsApp=${waNotify}`);
            });
        });