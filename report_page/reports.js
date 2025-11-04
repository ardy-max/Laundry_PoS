  // JavaScript for Time and Interactivity
        document.addEventListener('DOMContentLoaded', function () {
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-primary d-lg-none position-absolute top-0 end-0 m-2';
            toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
            document.body.appendChild(toggleBtn);

            // Mobile sidebar close on click outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && window.innerWidth < 992) {
                    sidebar.classList.remove('show');
                }
            });

            // Transaction Time
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
                transactionTime.textContent = `Report Generated: ${now.toLocaleString('id-ID', options).replace('WIB', '')} WIB`;
            }
            updateTransactionTime(); // Set initial time
            setInterval(updateTransactionTime, 60000); // Update every minute

            // Filter and Export Buttons (Placeholder Logic)
            const filterBtn = document.querySelector('.btn-primary');
            const exportBtn = document.querySelector('.btn-outline-secondary');
            filterBtn.addEventListener('click', () => {
                alert('Filtering data based on selected dates...'); // Replace with actual filter logic
            });
            exportBtn.addEventListener('click', () => {
                alert('Exporting report...'); // Replace with export logic (e.g., CSV/PDF)
            });
        });