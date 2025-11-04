 // JavaScript for Payment Calculation and Time
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

            // Payment Calculation
            const amountInput = document.getElementById('amount');
            const changeDisplay = document.getElementById('change');
            const transactionTime = document.getElementById('transactionTime');
            const total = 25.00; // Hardcoded total from summary

            // Set initial transaction time
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
                transactionTime.textContent = `Transaction Time: ${now.toLocaleString('id-ID', options).replace('WIB', '')} WIB`;
            }
            updateTransactionTime(); // Set initial time
            setInterval(updateTransactionTime, 60000); // Update every minute

            amountInput.addEventListener('input', function () {
                const amount = parseFloat(this.value) || 0.00;
                const change = amount - total;
                changeDisplay.textContent = `$${change.toFixed(2)}`;
            });

            // Complete Payment Button
            const completePaymentBtn = document.getElementById('completePayment');
            completePaymentBtn.addEventListener('click', function () {
                const amount = parseFloat(amountInput.value) || 0.00;
                if (amount < total) {
                    alert('Amount must be equal to or greater than the total ($25.00)');
                } else {
                    alert(`Payment completed successfully at ${new Date().toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })} WIB!`);
                    // Add logic to save payment or redirect
                }
            });

            // Print Receipt Button
            const printReceiptBtn = document.getElementById('printReceipt');
            printReceiptBtn.addEventListener('click', function () {
                const amount = parseFloat(amountInput.value) || 0.00;
                const change = amount - total;
                const receiptContent = `
                    Laundry POS Receipt
                    -------------------
                    Date: ${new Date().toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })} WIB
                    Time: ${new Date().toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })} WIB
                    Subtotal: $25.00
                    Discount: $0.00
                    Total: $25.00
                    Paid: $${amount.toFixed(2)}
                    Change: $${change.toFixed(2)}
                    -------------------
                    Thank you for your business!
                `;
                alert('Printing receipt...\n\n' + receiptContent); // Replace with actual print logic
                // window.print(); // Uncomment for actual printing (ensure CSS for print)
            });
        });