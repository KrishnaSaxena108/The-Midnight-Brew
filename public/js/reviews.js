// Reviews functionality for The Midnight Brew
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.getElementById('reviewsCarousel');

  // Review Form Submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));

    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(reviewForm);
      const reviewData = {
        name: formData.get('reviewerName') || 'Anonymous',
        rating: parseInt(formData.get('rating')),
        menuItem: formData.get('menuItem'),
        text: formData.get('reviewText'),
        date: 'Just now'
      };

      if (reviewData.rating && reviewData.text && reviewData.menuItem) {
        addNewReview(reviewData);
        updateStats();
        reviewModal.hide();
        reviewForm.reset();

        showNotification('Thank you for your review! It will appear in the scroll soon.', 'success');
      }
    });
  }

  function addNewReview(reviewData) {
    if (!carousel) return;
    
    const colors = ['primary', 'success', 'info', 'warning', 'danger'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const starsHtml = generateStars(reviewData.rating);

    const newReviewHtml = `
      <div class="review-slide">
        <div class="review-card">
          <div class="review-header d-flex align-items-center mb-3">
            <div class="reviewer-avatar me-3">
              <i class="fas fa-user-circle fa-2x text-${randomColor}"></i>
            </div>
            <div>
              <h6 class="reviewer-name mb-1">${reviewData.name}</h6>
              <div class="review-rating">
                ${starsHtml}
              </div>
            </div>
          </div>
          <div class="review-content">
            <p class="review-text">"${reviewData.text}"</p>
            <div class="review-item mt-2">
              <small class="text-muted">Reviewed: ${reviewData.menuItem}</small>
            </div>
            <div class="review-date">
              <small class="text-muted">${reviewData.date}</small>
            </div>
          </div>
        </div>
      </div>
    `;

    const existingSlides = carousel.querySelectorAll('.review-slide');
    const insertPosition = Math.floor(Math.random() * Math.min(3, existingSlides.length));

    if (insertPosition === 0) {
      carousel.insertAdjacentHTML('afterbegin', newReviewHtml);
    } else {
      existingSlides[insertPosition].insertAdjacentHTML('beforebegin', newReviewHtml);
    }

    carousel.insertAdjacentHTML('beforeend', newReviewHtml);
  }

  function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHtml += '<i class="fas fa-star text-warning"></i>';
      } else {
        starsHtml += '<i class="far fa-star text-warning"></i>';
      }
    }
    return starsHtml;
  }

  function updateStats() {
    const allRatings = [];
    const uniqueReviews = new Set();

    document.querySelectorAll('.review-slide').forEach(slide => {
      const reviewText = slide.querySelector('.review-text').textContent;
      if (!uniqueReviews.has(reviewText)) {
        uniqueReviews.add(reviewText);
        const filledStars = slide.querySelectorAll('.review-rating .fas.fa-star').length;
        allRatings.push(filledStars);
      }
    });

    if (allRatings.length === 0) return;

    const avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
    const totalReviews = allRatings.length;
    const satisfactionRate = Math.round((allRatings.filter(r => r >= 4).length / totalReviews) * 100);

    const avgRatingEl = document.getElementById('averageRating');
    const totalReviewsEl = document.getElementById('totalReviews');
    const satisfactionRateEl = document.getElementById('satisfactionRate');

    if (avgRatingEl) avgRatingEl.textContent = avgRating;
    if (totalReviewsEl) totalReviewsEl.textContent = totalReviews.toLocaleString();
    if (satisfactionRateEl) satisfactionRateEl.textContent = satisfactionRate + '%';

    document.querySelectorAll('.stat-card').forEach(card => {
      card.style.transform = 'scale(1.05)';
      setTimeout(() => {
        card.style.transform = 'scale(1)';
      }, 200);
    });
  }

  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} position-fixed`;
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      animation: slideInRight 0.5s ease;
    `;
    notification.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
      }
    }, 4000);
  }
});