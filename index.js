// Simple responsive sidebar toggle for mobile
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('show');
        }

        // Auto-hide sidebar on mobile after clicking a link
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    const sidebar = document.querySelector('.sidebar');
                    sidebar.classList.remove('show');
                }
            });
        });