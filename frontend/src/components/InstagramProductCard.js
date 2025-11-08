import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import '../styles/instagram-mobile.css';

/**
 * InstagramProductCard - Example component showing Instagram-style product card
 * This is a reference implementation - adapt as needed
 */
const InstagramProductCard = ({ product }) => {
  const [liked, setLiked] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 600);
    }
  };

  const handleLikeClick = () => {
    setLiked(!liked);
  };

  return (
    <article className="instagram-card">
      {/* Card Header */}
      <div className="instagram-card__header">
        <img
          src={product.brand?.logo || '/default-avatar.png'}
          alt={product.brand?.name}
          className="instagram-card__avatar"
        />
        <div className="instagram-card__header-info">
          <h3 className="instagram-card__title">{product.name}</h3>
          <p className="instagram-card__subtitle">{product.category}</p>
        </div>
        <button className="instagram-card__action" aria-label="More options">
          ⋮
        </button>
      </div>

      {/* Card Image */}
      <div className="instagram-card__media" onDoubleClick={handleDoubleTap}>
        <img
          src={product.image}
          alt={product.name}
          className="instagram-card__image"
          loading="lazy"
        />
        {/* Like Animation */}
        <div
          className={`instagram-card__like-animation ${
            showLikeAnimation ? 'instagram-card__like-animation--active' : ''
          }`}
        >
          <FaHeart size={80} />
        </div>
      </div>

      {/* Card Actions */}
      <div className="instagram-card__actions">
        <button
          onClick={handleLikeClick}
          className={`instagram-card__action-btn ${
            liked ? 'instagram-card__action-btn--liked' : ''
          }`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? (
            <FaHeart className="instagram-card__action-icon" />
          ) : (
            <FiHeart className="instagram-card__action-icon" />
          )}
        </button>
        <button className="instagram-card__action-btn" aria-label="Comment">
          <FiMessageCircle className="instagram-card__action-icon" />
        </button>
        <button className="instagram-card__action-btn" aria-label="Share">
          <FiSend className="instagram-card__action-icon" />
        </button>
        <span className="instagram-card__action-spacer" />
        <button className="instagram-card__action-btn" aria-label="Save">
          <FiBookmark className="instagram-card__action-icon" />
        </button>
      </div>

      {/* Card Info */}
      <div className="instagram-card__info">
        <p className="instagram-card__likes">
          {product.likes?.toLocaleString() || 0} likes
        </p>
        <div className="instagram-card__caption">
          <span className="instagram-card__caption-user">easycart</span>
          {product.description}
        </div>
        {product.reviews > 0 && (
          <p className="instagram-card__subtitle" style={{ marginTop: '4px' }}>
            View all {product.reviews} comments
          </p>
        )}
        <div className="instagram-card__price">
          <span className="instagram-card__price-current">
            ${product.price?.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="instagram-card__price-original">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.discount && (
            <span className="instagram-card__discount-badge">
              {product.discount}% OFF
            </span>
          )}
        </div>
        <Link
          to={`/product/${product.id}`}
          className="instagram-card__action-btn"
          style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
        >
          View Product
        </Link>
      </div>
    </article>
  );
};

/**
 * InstagramStories - Example stories section
 */
const InstagramStories = ({ categories }) => {
  return (
    <div className="mobile-stories">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="mobile-story"
        >
          <div
            className={`mobile-story__ring ${
              category.viewed ? 'mobile-story__ring--viewed' : ''
            }`}
          >
            <img
              src={category.image}
              alt={category.name}
              className="mobile-story__avatar"
            />
          </div>
          <span className="mobile-story__label">{category.name}</span>
        </Link>
      ))}
    </div>
  );
};

/**
 * InstagramGrid - Example grid layout for explore/shop
 */
const InstagramGrid = ({ products }) => {
  return (
    <div className="mobile-grid">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.id}`}
          className="mobile-grid__item"
        >
          <img
            src={product.image}
            alt={product.name}
            className="mobile-grid__image"
            loading="lazy"
          />
          <div className="mobile-grid__overlay">
            <div className="mobile-grid__stats">
              <span>❤️ {product.likes}</span>
              <span>💬 {product.reviews}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

/**
 * MobileFeed - Complete Instagram-style mobile feed example
 */
const MobileFeed = ({ categories, products }) => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="mobile-feed">
      {/* Stories Section */}
      <InstagramStories categories={categories} />

      {/* Search Bar */}
      <div className="mobile-search">
        <input
          type="search"
          placeholder="Search products..."
          className="mobile-search__input"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${activeTab === 'feed' ? 'mobile-tab--active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Feed
        </button>
        <button
          className={`mobile-tab ${activeTab === 'shop' ? 'mobile-tab--active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          Shop
        </button>
        <button
          className={`mobile-tab ${activeTab === 'deals' ? 'mobile-tab--active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          Deals
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'feed' && (
        <div>
          {products.map((product) => (
            <InstagramProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {activeTab === 'shop' && <InstagramGrid products={products} />}

      {activeTab === 'deals' && (
        <div>
          {products
            .filter((p) => p.discount)
            .map((product) => (
              <InstagramProductCard key={product.id} product={product} />
            ))}
        </div>
      )}
    </div>
  );
};

// Export all components
export { InstagramProductCard, InstagramStories, InstagramGrid, MobileFeed };
export default InstagramProductCard;
