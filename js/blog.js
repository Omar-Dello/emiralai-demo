/**
 * Blog Management System
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * Description: Handles blog functionality with dynamic post loading, filtering, and search
 * 
 * =====================================================
 * HOW TO ADD NEW BLOG POSTS:
 * 1. Add your images to the /images/ folder
 * 2. Add a new post object to the blogPostsData.posts array
 * 3. Make sure to include all required fields (see example below)
 * =====================================================
 */

// Blog configuration
const BLOG_CONFIG = {
    postsPerPage: 6,
    searchDelay: 300,
    animationDuration: 300,
    imagePath: 'images/',
    defaultImage: 'images/placeholder.png',
    defaultAvatar: 'images/default-avatar.png',
    lazyLoadOffset: 50 // pixels before viewport
};

/**
 * Blog Posts Database
 * Add/Edit posts here - Image paths are relative to the root directory
 * 
 * Example post structure:
 * {
 *     id: 14,                                      // Unique ID
 *     title: "Your Post Title",                    // Post title
 *     excerpt: "Short description...",             // Short description for card
 *     content: `<h2>Full HTML content...</h2>`,    // Full post content with HTML
 *     category: "ai",                              // Category: "ai", "ml", or "tech"
 *     image: "images/your-image.png",              // Post image path
 *     author: {
 *         name: "Author Name",                     // Author full name
 *         avatar: "images/author-avatar.jpg",      // Author avatar path
 *         role: "Job Title"                        // Author job title
 *     },
 *     date: "March 20, 2024",                      // Publication date
 *     readTime: "5 min read",                      // Estimated read time
 *     featured: false                              // Set to true to feature this post
 * }
 */
const blogPostsData = {
    posts: [
        {
            id: 1,
            title: "Understanding Neural Networks: A Comprehensive Guide",
            excerpt: "Dive deep into the world of neural networks and learn how they power modern AI systems.",
            content: `
                <h2>Introduction to Neural Networks</h2>
                <p>Neural networks are the backbone of modern artificial intelligence, inspired by the biological neural networks that constitute animal brains. These computational models have revolutionized how we approach complex problems in machine learning.</p>
                
                <h3>Key Components</h3>
                <ul>
                    <li>Input Layer: Receives initial data and processes it for the network</li>
                    <li>Hidden Layers: Perform complex computations and feature extraction</li>
                    <li>Output Layer: Produces the final results or predictions</li>
                </ul>
                
                <h2>How Neural Networks Work</h2>
                <p>At their core, neural networks consist of interconnected nodes (neurons) that process information through weighted connections. Each node performs a simple computation and passes its output to the next layer. This process continues until the final output is produced.</p>
                
                <h3>Real-World Applications</h3>
                <ul>
                    <li>Image Recognition: Identifying objects in photos and videos</li>
                    <li>Natural Language Processing: Understanding and generating human language</li>
                    <li>Autonomous Vehicles: Making real-time decisions for self-driving cars</li>
                    <li>Medical Diagnosis: Analyzing medical images and patient data</li>
                </ul>
            `,
            category: "ai",
            image: "images/head-ai.png",
            author: {
                name: "Dr. Sarah Chen",
                avatar: "images/person-5.png",
                role: "AI Research Lead"
            },
            date: "March 15, 2024",
            readTime: "8 min read",
            featured: true
        },
        {
            id: 2,
            title: "Machine Learning in Healthcare: Revolutionizing Patient Care",
            excerpt: "Discover how machine learning is transforming healthcare delivery and improving patient outcomes.",
            content: `
                <h2>The Healthcare Revolution</h2>
                <p>The healthcare industry is undergoing a significant transformation through the integration of machine learning technologies. These advancements are not just improving efficiency but are fundamentally changing how we approach patient care and medical research.</p>
                
                <h3>Key Applications in Healthcare</h3>
                <ul>
                    <li>Early Disease Detection: Identifying potential health issues before symptoms appear</li>
                    <li>Personalized Treatment Plans: Creating customized care strategies based on patient data</li>
                    <li>Medical Image Analysis: Improving accuracy in diagnosing conditions from scans</li>
                    <li>Drug Discovery: Accelerating the development of new medications</li>
                </ul>
            `,
            category: "ml",
            image: "images/ai-healthcare.png",
            author: {
                name: "Dr. Michael Roberts",
                avatar: "images/person-1.png",
                role: "Healthcare AI Specialist"
            },
            date: "March 12, 2024",
            readTime: "6 min read"
        },
        {
            id: 3,
            title: "The Future of AI: Trends to Watch in 2024",
            excerpt: "Explore the most promising AI trends that will shape the future of technology.",
            content: `
                <h2>AI Trends Shaping 2024</h2>
                <p>As we progress through 2024, several key trends are emerging that will define the future of artificial intelligence. These developments are not just technological advancements but represent fundamental shifts in how we interact with and benefit from AI systems.</p>
                
                <h3>Major Trends to Watch</h3>
                <ul>
                    <li>Multimodal AI: Systems that can process and understand multiple types of data simultaneously</li>
                    <li>Edge AI: Moving AI processing to local devices for faster, more private computing</li>
                    <li>AI Governance: New frameworks for responsible AI development and deployment</li>
                    <li>Quantum AI: The intersection of quantum computing and artificial intelligence</li>
                </ul>
            `,
            category: "tech",
            image: "images/computer-ai.png",
            author: {
                name: "Alex Thompson",
                avatar: "images/person-2.png",
                role: "Tech Analyst"
            },
            date: "March 10, 2024",
            readTime: "5 min read"
        },
        {
            id: 4,
            title: "Natural Language Processing: Breaking Down Language Barriers",
            excerpt: "How NLP is revolutionizing communication and understanding across different languages.",
            content: `
                <h2>NLP Revolution</h2>
                <p>Natural Language Processing is transforming how we interact with technology and each other. From simple text analysis to complex language understanding, NLP is breaking down barriers in communication.</p>
                
                <h3>Key Applications</h3>
                <ul>
                    <li>Machine Translation: Breaking language barriers in real-time</li>
                    <li>Sentiment Analysis: Understanding emotions in text</li>
                    <li>Chatbots: Providing natural conversation interfaces</li>
                    <li>Text Summarization: Condensing long documents into key points</li>
                </ul>
            `,
            category: "ai",
            image: "images/natural-language.png",
            author: {
                name: "Emma Wilson",
                avatar: "images/person-6.png",
                role: "NLP Engineer"
            },
            date: "March 8, 2024",
            readTime: "7 min read"
        },
        {
            id: 5,
            title: "Computer Vision: Teaching Machines to See",
            excerpt: "Understanding how AI systems process and interpret visual information.",
            content: `
                <h2>Seeing Through AI</h2>
                <p>Computer vision is enabling machines to understand and interpret visual information like never before. This technology is revolutionizing how we interact with the visual world.</p>
                
                <h3>Applications</h3>
                <ul>
                    <li>Object Detection: Identifying and tracking objects in real-time</li>
                    <li>Facial Recognition: Security and authentication systems</li>
                    <li>Medical Imaging: Enhanced diagnostic capabilities</li>
                    <li>Autonomous Vehicles: Visual navigation and obstacle detection</li>
                </ul>
            `,
            category: "ml",
            image: "images/teaching-machine.png",
            author: {
                name: "James Anderson",
                avatar: "images/me.jpg",
                role: "Computer Vision Expert"
            },
            date: "March 5, 2024",
            readTime: "6 min read"
        },
        {
            id: 6,
            title: "AI Ethics: Navigating the Future Responsibly",
            excerpt: "Exploring the ethical considerations in AI development and deployment.",
            content: `
                <h2>Ethical AI</h2>
                <p>As AI becomes more powerful, ethical considerations become increasingly important. We must ensure that AI systems are developed and deployed responsibly.</p>
                
                <h3>Key Considerations</h3>
                <ul>
                    <li>Bias and Fairness: Ensuring AI systems treat all users equally</li>
                    <li>Privacy: Protecting user data and maintaining confidentiality</li>
                    <li>Transparency: Making AI decisions understandable and explainable</li>
                    <li>Accountability: Establishing clear responsibility for AI actions</li>
                </ul>
            `,
            category: "tech",
            image: "images/ai-ethics.png",
            author: {
                name: "Lisa Chen",
                avatar: "images/person-6.png",
                role: "AI Ethics Researcher"
            },
            date: "March 3, 2024",
            readTime: "5 min read"
        },
        {
            id: 7,
            title: "Deep Learning: The Power of Neural Networks",
            excerpt: "A deep dive into deep learning and its applications in modern AI systems.",
            content: `
                <h2>Deep Learning Basics</h2>
                <p>Deep learning is revolutionizing how we approach complex problems in AI. By using multiple layers of neural networks, we can solve increasingly sophisticated tasks.</p>
                
                <h3>Key Concepts</h3>
                <ul>
                    <li>Neural Network Architecture: Understanding layer structures</li>
                    <li>Training Methods: Backpropagation and optimization</li>
                    <li>Applications: From image recognition to natural language processing</li>
                    <li>Future Developments: Emerging trends in deep learning</li>
                </ul>
            `,
            category: "ai",
            image: "images/ai-in-education.png",
            author: {
                name: "David Kumar",
                avatar: "images/",
                role: "Deep Learning Specialist"
            },
            date: "March 1, 2024",
            readTime: "8 min read"
        },
        {
            id: 8,
            title: "AI in Business: Transforming Industries",
            excerpt: "How artificial intelligence is reshaping business operations and strategies.",
            content: `
                <h2>Business Transformation</h2>
                <p>AI is fundamentally changing how businesses operate and compete. From automation to decision-making, AI is reshaping the business landscape.</p>
                
                <h3>Impact Areas</h3>
                <ul>
                    <li>Process Automation: Streamlining operations</li>
                    <li>Customer Service: Enhanced support through AI assistants</li>
                    <li>Data Analysis: Better business insights</li>
                    <li>Product Development: Faster innovation cycles</li>
                </ul>
            `,
            category: "tech",
            image: "images/ai-in-business.png",
            author: {
                name: "Sophia Martinez",
                avatar: "images/",
                role: "Business AI Consultant"
            },
            date: "February 28, 2024",
            readTime: "6 min read"
        },
        {
            id: 9,
            title: "Reinforcement Learning: Training AI Through Experience",
            excerpt: "Understanding how AI systems learn through trial and error.",
            content: `
                <h2>Learning Through Experience</h2>
                <p>Reinforcement learning is teaching AI to make better decisions through experience. This approach mimics how humans learn from trial and error.</p>
                
                <h3>Key Concepts</h3>
                <ul>
                    <li>Reward Systems: Guiding AI behavior</li>
                    <li>Policy Optimization: Improving decision-making</li>
                    <li>Applications: From gaming to robotics</li>
                    <li>Future Potential: Expanding capabilities</li>
                </ul>
            `,
            category: "ml",
            image: "images/ai-in-education.png",
            author: {
                name: "Ryan Thompson",
                avatar: "images/person-3.png",
                role: "RL Researcher"
            },
            date: "February 25, 2024",
            readTime: "7 min read"
        },
        {
            id: 10,
            title: "AI and Climate Change: A Sustainable Future",
            excerpt: "How artificial intelligence is helping combat climate change.",
            content: `
                <h2>AI for Sustainability</h2>
                <p>Discover how AI is being used to create a more sustainable future. From climate modeling to resource optimization, AI is helping address environmental challenges.</p>
                
                <h3>Applications</h3>
                <ul>
                    <li>Climate Modeling: Predicting environmental changes</li>
                    <li>Energy Optimization: Reducing consumption</li>
                    <li>Resource Management: Efficient allocation</li>
                    <li>Environmental Monitoring: Tracking ecosystem health</li>
                </ul>
            `,
            category: "tech",
            image: "images/ai-climate-change.png",
            author: {
                name: "Maya Patel",
                avatar: "images/lap.png",
                role: "Environmental AI Specialist"
            },
            date: "February 22, 2024",
            readTime: "6 min read"
        },
        {
            id: 11,
            title: "Quantum Computing and AI: The Next Frontier",
            excerpt: "Exploring the intersection of quantum computing and artificial intelligence.",
            content: `
                <h2>Quantum AI</h2>
                <p>How quantum computing is set to revolutionize AI capabilities. The combination of quantum computing and AI promises unprecedented computational power.</p>
                
                <h3>Key Areas</h3>
                <ul>
                    <li>Quantum Algorithms: New approaches to problem-solving</li>
                    <li>Machine Learning: Enhanced training capabilities</li>
                    <li>Optimization: Solving complex problems faster</li>
                    <li>Future Applications: Potential breakthroughs</li>
                </ul>
            `,
            category: "ai",
            image: "images/computer-ai.png",
            author: {
                name: "Chris Wilson",
                avatar: "images/person-4.png",
                role: "Quantum AI Researcher"
            },
            date: "February 20, 2024",
            readTime: "8 min read"
        },
        {
            id: 12,
            title: "AI in Education: Personalized Learning",
            excerpt: "How artificial intelligence is transforming education.",
            content: `
                <h2>Education Revolution</h2>
                <p>AI is making education more personalized and accessible than ever. From adaptive learning to automated grading, AI is transforming the educational landscape.</p>
                
                <h3>Applications</h3>
                <ul>
                    <li>Personalized Learning: Customized educational experiences</li>
                    <li>Automated Assessment: Efficient grading and feedback</li>
                    <li>Learning Analytics: Tracking student progress</li>
                    <li>Virtual Tutors: 24/7 learning support</li>
                </ul>
            `,
            category: "tech",
            image: "images/ai-education-personalized.png",
            author: {
                name: "Anna Lee",
                avatar: "images/",
                role: "EdTech AI Specialist"
            },
            date: "February 18, 2024",
            readTime: "5 min read"
        },
        {
            id: 13,
            title: "The Evolution of AI Assistants",
            excerpt: "From simple chatbots to sophisticated AI companions.",
            content: `
                <h2>AI Assistant Evolution</h2>
                <p>How AI assistants have evolved and what's next in their development. From simple chatbots to sophisticated virtual companions, AI assistants are becoming increasingly capable.</p>
                
                <h3>Development Stages</h3>
                <ul>
                    <li>Early Chatbots: Basic text-based interactions</li>
                    <li>Voice Assistants: Natural language processing</li>
                    <li>Contextual Understanding: More natural conversations</li>
                    <li>Future Developments: Enhanced capabilities</li>
                </ul>
            `,
            category: "ai",
            image: "images/ai-evolution.png",
            author: {
                name: "Marcus Johnson",
                avatar: "images/person-4",
                role: "AI Assistant Developer"
            },
            date: "February 15, 2024",
            readTime: "6 min read"
        }
    ]
};

/**
 * Lazy Image Loader Class
 * Handles efficient image loading for better performance
 */
class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${BLOG_CONFIG.lazyLoadOffset}px`
            });
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Create a new image to preload
        const imageLoader = new Image();

        imageLoader.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            delete img.dataset.src;
        };

        imageLoader.onerror = () => {
            img.src = BLOG_CONFIG.defaultImage;
            img.classList.add('error');
            console.warn(`Failed to load image: ${src}`);
        };

        imageLoader.src = src;
    }

    observe(img) {
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        } else {
            // Fallback for browsers without Intersection Observer
            this.loadImage(img);
        }
    }

    disconnect() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
    }
}

/**
 * Blog Manager Class
 * Handles all blog functionality
 */
class BlogManager {
    constructor() {
        this.posts = blogPostsData.posts;
        this.filteredPosts = [...this.posts];
        this.currentCategory = 'all';
        this.displayedPosts = BLOG_CONFIG.postsPerPage;
        this.isSearching = false;
        this.searchTimer = null;
        this.imageLoader = new LazyImageLoader();

        this.init();
    }

    /**
     * Initialize the blog
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.renderFeaturedPost();
        this.renderPosts();
        this.updateLoadMoreButton();
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            postsContainer: document.getElementById('blog-posts'),
            categoryButtons: document.querySelectorAll('.category-btn'),
            searchInput: document.querySelector('.blog-search input'),
            searchButton: document.querySelector('.blog-search .btn'),
            loadMoreBtn: document.getElementById('load-more'),
            featuredPost: document.querySelector('.featured-post'),
            newsletterForm: document.getElementById('newsletter-form')
        };
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Category filtering
        this.elements.categoryButtons.forEach(button => {
            button.addEventListener('click', () => this.filterByCategory(button));
        });

        // Search functionality
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.elements.searchButton.addEventListener('click', () => this.performSearch());

        // Enter key in search
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });

        // Load more functionality
        this.elements.loadMoreBtn.addEventListener('click', () => this.loadMorePosts());

        // Newsletter form
        if (this.elements.newsletterForm) {
            this.elements.newsletterForm.addEventListener('submit', (e) => this.handleNewsletter(e));
        }

        // Post click handlers (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.blog-post')) {
                const post = e.target.closest('.blog-post');
                const postId = post.dataset.postId;
                if (postId) this.showPostModal(parseInt(postId));
            }

            if (e.target.closest('.read-more-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const postId = e.target.closest('.read-more-btn').dataset.postId;
                if (postId) this.showPostModal(parseInt(postId));
            }
        });
    }

    /**
     * Filter posts by category with animation
     */
    filterByCategory(button) {
        const category = button.dataset.category;

        // Update active state
        this.elements.categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter posts
        this.currentCategory = category;
        if (category === 'all') {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => post.category === category);
        }

        // Reset displayed posts count and search
        this.displayedPosts = BLOG_CONFIG.postsPerPage;
        this.elements.searchInput.value = '';

        // Re-render with animation
        this.animatePostsOut(() => {
            this.renderPosts();
            this.updateLoadMoreButton();
        });
    }

    /**
     * Handle search input with debouncing
     */
    handleSearch(e) {
        const searchTerm = e.target.value.trim();

        // Clear existing timer
        clearTimeout(this.searchTimer);

        // Show loading state on search button
        this.setSearchLoading(true);

        // Debounce search
        this.searchTimer = setTimeout(() => {
            this.performSearch(searchTerm);
        }, BLOG_CONFIG.searchDelay);
    }

    /**
     * Perform search with highlighting
     */
    performSearch(searchTerm = null) {
        if (searchTerm === null) {
            searchTerm = this.elements.searchInput.value.trim();
        }

        if (searchTerm === '') {
            this.filteredPosts = this.currentCategory === 'all'
                ? [...this.posts]
                : this.posts.filter(post => post.category === this.currentCategory);
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredPosts = this.posts.filter(post => {
                const matchesSearch = post.title.toLowerCase().includes(term) ||
                    post.excerpt.toLowerCase().includes(term) ||
                    post.content.toLowerCase().includes(term) ||
                    post.author.name.toLowerCase().includes(term);

                const matchesCategory = this.currentCategory === 'all' ||
                    post.category === this.currentCategory;

                return matchesSearch && matchesCategory;
            });
        }

        // Reset displayed posts count
        this.displayedPosts = BLOG_CONFIG.postsPerPage;

        // Re-render with animation
        this.animatePostsOut(() => {
            this.renderPosts();
            this.updateLoadMoreButton();
            this.setSearchLoading(false);
        });
    }

    /**
     * Set search loading state
     */
    setSearchLoading(isLoading) {
        const icon = this.elements.searchButton.querySelector('i');
        if (isLoading) {
            icon.className = 'fas fa-spinner fa-spin';
        } else {
            icon.className = 'fas fa-search';
        }
    }

    /**
     * Load more posts with smooth animation
     */
    loadMorePosts() {
        const currentCount = this.displayedPosts;

        if (this.displayedPosts >= this.filteredPosts.length) {
            // Show less - scroll to top and collapse
            this.displayedPosts = BLOG_CONFIG.postsPerPage;

            // Smooth scroll to blog posts section
            this.elements.postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setTimeout(() => {
                this.renderPosts();
                this.updateLoadMoreButton();
            }, 300);
        } else {
            // Show more
            this.displayedPosts = Math.min(
                this.displayedPosts + BLOG_CONFIG.postsPerPage,
                this.filteredPosts.length
            );

            // Render only new posts
            this.renderNewPosts(currentCount, this.displayedPosts);
            this.updateLoadMoreButton();
        }
    }

    /**
     * Update load more button text and state
     */
    updateLoadMoreButton() {
        const totalPosts = this.filteredPosts.length;
        const remainingPosts = totalPosts - this.displayedPosts;

        if (totalPosts <= BLOG_CONFIG.postsPerPage) {
            this.elements.loadMoreBtn.style.display = 'none';
        } else {
            this.elements.loadMoreBtn.style.display = 'flex';

            if (remainingPosts <= 0) {
                this.elements.loadMoreBtn.innerHTML = `
                    <i class="fas fa-minus"></i> Show Less
                `;
            } else {
                this.elements.loadMoreBtn.innerHTML = `
                    <i class="fas fa-plus"></i> Load More Posts (${remainingPosts} remaining)
                `;
            }
        }
    }

    /**
     * Render featured post
     */
    renderFeaturedPost() {
        const featured = this.posts.find(post => post.featured) || this.posts[0];
        if (!featured || !this.elements.featuredPost) return;

        this.elements.featuredPost.innerHTML = `
            <div class="featured-content">
                <span class="post-category">FEATURED</span>
                <h2>${this.escapeHtml(featured.title)}</h2>
                <p>${this.escapeHtml(featured.excerpt)}</p>
                <div class="post-meta">
                    <span><i class="far fa-clock"></i> ${this.escapeHtml(featured.readTime)}</span>
                    <span><i class="far fa-calendar"></i> ${this.escapeHtml(featured.date)}</span>
                </div>
                <button class="btn read-more-btn" data-post-id="${featured.id}">
                    Read Article
                </button>
            </div>
            <div class="featured-image">
                <img 
                    data-src="${this.escapeHtml(featured.image)}" 
                    alt="${this.escapeHtml(featured.title)}" 
                    loading="lazy"
                    class="featured-thumbnail"
                >
            </div>
        `;

        // Observe image for lazy loading
        const img = this.elements.featuredPost.querySelector('img[data-src]');
        if (img) this.imageLoader.observe(img);
    }

    /**
     * Render all visible posts
     */
    renderPosts() {
        const postsToShow = this.filteredPosts.slice(0, this.displayedPosts);

        if (postsToShow.length === 0) {
            this.elements.postsContainer.innerHTML = `
                <div class="no-posts-message">
                    <i class="fas fa-search"></i>
                    <h3>No posts found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        this.elements.postsContainer.innerHTML = postsToShow.map(post => this.createPostHTML(post)).join('');

        // Setup lazy loading for all images
        this.setupLazyLoading();

        // Add entrance animation
        this.animatePostsEntrance();
    }

    /**
     * Render only new posts (for load more)
     */
    renderNewPosts(startIndex, endIndex) {
        const newPosts = this.filteredPosts.slice(startIndex, endIndex);
        const newPostsHTML = newPosts.map(post => this.createPostHTML(post)).join('');

        // Add new posts to container
        this.elements.postsContainer.insertAdjacentHTML('beforeend', newPostsHTML);

        // Setup lazy loading for new images
        this.setupLazyLoading();

        // Animate only new posts
        const allPosts = this.elements.postsContainer.querySelectorAll('.blog-post');
        const newPostElements = Array.from(allPosts).slice(startIndex);

        newPostElements.forEach((post, index) => {
            post.style.opacity = '0';
            post.style.transform = 'translateY(20px)';

            setTimeout(() => {
                post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    /**
     * Create HTML for a single post
     */
    createPostHTML(post) {
        return `
            <article class="blog-post glass-card" data-post-id="${post.id}" data-category="${post.category}">
                <div class="post-image">
                    <img 
                        data-src="${this.escapeHtml(post.image)}" 
                        alt="${this.escapeHtml(post.title)}" 
                        loading="lazy"
                        class="post-thumbnail"
                    >
                </div>
                <div class="post-content">
                    <h3>${this.escapeHtml(post.title)}</h3>
                    <p>${this.escapeHtml(post.excerpt)}</p>
                    <div class="post-footer">
                        <div class="post-author">
                            <div class="author-avatar">
                                <img 
                                    data-src="${this.escapeHtml(post.author.avatar)}" 
                                    alt="${this.escapeHtml(post.author.name)}" 
                                    loading="lazy"
                                    class="author-thumbnail"
                                >
                            </div>
                            <div class="author-info">
                                <h4>${this.escapeHtml(post.author.name)}</h4>
                                <span>${this.escapeHtml(post.author.role)}</span>
                            </div>
                        </div>
                        <div class="post-meta">
                            <span><i class="far fa-clock"></i> ${this.escapeHtml(post.readTime)}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Setup lazy loading for all images with data-src
     */
    setupLazyLoading() {
        const images = this.elements.postsContainer.querySelectorAll('img[data-src]');
        images.forEach(img => this.imageLoader.observe(img));
    }

    /**
     * Animate posts entrance
     */
    animatePostsEntrance() {
        const posts = this.elements.postsContainer.querySelectorAll('.blog-post');
        posts.forEach((post, index) => {
            post.style.opacity = '0';
            post.style.transform = 'translateY(20px)';

            setTimeout(() => {
                post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    /**
     * Animate posts out before changing content
     */
    animatePostsOut(callback) {
        const posts = this.elements.postsContainer.querySelectorAll('.blog-post');

        if (posts.length === 0) {
            callback();
            return;
        }

        posts.forEach((post, index) => {
            setTimeout(() => {
                post.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                post.style.opacity = '0';
                post.style.transform = 'translateY(-20px)';
            }, index * 30);
        });

        setTimeout(callback, posts.length * 30 + 300);
    }

    /**
     * Show post modal with full content
     */
    showPostModal(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content glass-card">
                <button class="modal-close" aria-label="Close modal"><i class="fas fa-times"></i></button>
                <div class="post-header">
                    <h2>${this.escapeHtml(post.title)}</h2>
                    <div class="post-meta">
                        <span><i class="far fa-clock"></i> ${this.escapeHtml(post.readTime)}</span>
                        <span><i class="far fa-calendar"></i> ${this.escapeHtml(post.date)}</span>
                    </div>
                    <div class="post-author">
                        <div class="author-avatar">
                            <img src="${this.escapeHtml(post.author.avatar)}" alt="${this.escapeHtml(post.author.name)}">
                        </div>
                        <div class="author-info">
                            <h4>${this.escapeHtml(post.author.name)}</h4>
                            <span>${this.escapeHtml(post.author.role)}</span>
                        </div>
                    </div>
                </div>
                <div class="post-body">
                    ${post.content}
                </div>
            </div>
        `;

        // Add to body
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Setup close handlers
        const closeModal = () => {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close on escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Add entrance animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    /**
     * Handle newsletter submission
     */
    handleNewsletter(e) {
        e.preventDefault();

        const email = e.target.querySelector('input[type="email"]').value;
        const button = e.target.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        button.disabled = true;

        // Simulate API call
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
            button.classList.add('success');

            // Reset form
            setTimeout(() => {
                e.target.reset();
                button.innerHTML = originalText;
                button.disabled = false;
                button.classList.remove('success');
            }, 3000);
        }, 1500);
    }

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Destroy the blog manager (cleanup)
     */
    destroy() {
        // Clear timers
        clearTimeout(this.searchTimer);

        // Disconnect lazy loader
        this.imageLoader.disconnect();

        // Remove event listeners
        document.removeEventListener('click', this.handlePostClick);
    }
}

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogManager, blogPostsData, BLOG_CONFIG };
}