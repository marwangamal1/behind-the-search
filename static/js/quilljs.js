  document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quill editor
    var quill = new Quill('#quillEditor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['link'],
          ['clean']
        ]
      },
      placeholder: 'Write your section description here...'
    });

    // Set initial content from Django form
    const descriptionField = document.querySelector('input[name="{{ form.description.html_name }}"]');
    if (descriptionField.value) {
      try {
        // Try to parse as delta if it's JSON formatted
        quill.setContents(JSON.parse(descriptionField.value));
      } catch (e) {
        // If not JSON, set as HTML
        quill.root.innerHTML = descriptionField.value;
      }
    }

    // Update hidden form field before submit
    const form = document.getElementById('sectionForm');
    form.addEventListener('submit', function() {
      descriptionField.value = quill.root.innerHTML;
    });

    // Add visual feedback when changes are made
    quill.on('text-change', function() {
      document.querySelector('.btn-save').classList.add('btn-highlight');
    });
  });