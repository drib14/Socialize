import Swal from 'sweetalert2'

export const customConfirm = async (text, title = "Are you sure?") => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981', // Leaf Green
        cancelButtonColor: '#6b7280', // Gray
        confirmButtonText: 'Yes, proceed!',
        background: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#f9fafb' : '#0f172a'
    })
    return result.isConfirmed;
}

export const customAlert = async (text, icon = 'info', title = 'Notification') => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    await Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#10b981',
        background: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#f9fafb' : '#0f172a'
    })
}
