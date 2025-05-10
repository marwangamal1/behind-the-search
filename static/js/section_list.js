document.addEventListener('DOMContentLoaded', function() {
    const sectionsGrid = document.querySelector('.sections-grid');
    if (!sectionsGrid) return;

    const sectionCards = Array.from(sectionsGrid.children);
    
    sectionCards.sort((a, b) => {

        const getNumber = el => {
            const text = el.querySelector('.section-number').textContent;
            return parseInt(text.match(/Section (\d+):/)[1]);
        };
        return getNumber(a) - getNumber(b);
    });


    sectionsGrid.innerHTML = '';
    sectionCards.forEach((card, index) => {

        card.dataset.aosDelay = (index + 1) * 100;
        sectionsGrid.appendChild(card);
    });

});
