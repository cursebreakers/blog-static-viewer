// scripts.js

async function getBlogs() {
    console.log('Getting blogs...')

    const BLOGS_API = 'http://192.168.1.242:6969/profile'
    
    try {

        const response = await fetch(BLOGS_API)

        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }

        // Parse the JSON response
        const blogs = await response.json();

        console.log(blogs)
        return blogs
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return null;
    }
}

async function renderBlogs(blogs) {
    // Get the blogViewer div from the html document
    const blogViewer = document.getElementById('blogViewer')

    try {
        blogViewer.innerHTML = '';

        const blogObjects = await getBlogs();

        blogObjects.blogs.forEach(blog => {
            const blogContainer = document.createElement('div');

            const blogLink = document.createElement('a');
            blogLink.href = `http://192.168.1.242:6969${blog.url}`;
            blogLink.textContent = blog.author.username;
            blogLink.classList.add('blog-link');

            blogContainer.appendChild(blogLink);
            blogContainer.classList.add('blog-container')
            blogContainer.appendChild(document.createElement('br'));

            blogViewer.appendChild(blogContainer);

            blogLink.addEventListener('click', async (event) => {
                event.preventDefault();

                const expandedContent = blogContainer.querySelector('.expanded-content');
                
                if (expandedContent) {
                    expandedContent.remove();
                
                } else {
                    try {
                        const response = await fetch(`http://192.168.1.242:6969${blog.url}`);
                        const data = await response.json();
                        // Render expanded content here
                        const newExpandedContent = document.createElement('div');

                        const blogContent = data
                        
                        // Render the title field
                        const titleElement = document.createElement('div');
                        titleElement.textContent = `${blogContent.title}`;
                        newExpandedContent.appendChild(titleElement);

                        // Render the category field
                        const categoryElement = document.createElement('div');
                        categoryElement.textContent = `${blogContent.category || 'Uncategorized'}`;
                        newExpandedContent.appendChild(categoryElement);

                        // Render the links field if it exists
                        if (Array.isArray(blogContent.links) && blogContent.links.length > 0) {
                            const linksElement = document.createElement('div');
                            linksElement.textContent = `${blogContent.links.join(', ')}`;
                            newExpandedContent.appendChild(linksElement);
                        }

                        // Handle rendering of public posts
                        if (Array.isArray(blogContent.posts) && blogContent.posts.length > 0) {
                            const postsElement = document.createElement('div');
                            postsElement.textContent = '';
                            blogContent.posts.forEach(post => {
                                if (post.public !== false) {
                                    const postElement = document.createElement('div');
                                    postElement.textContent = `${post.title}, ${new Date(post.timestamp).toLocaleString()}`;
                                    postsElement.appendChild(postElement);
                                }
                            });
                            newExpandedContent.appendChild(postsElement);
                        }

                        newExpandedContent.classList.add('expanded-content');

                        blogContainer.appendChild(newExpandedContent);

                    } catch (error) {
                        console.error('Error fetching blog data:', error);
                    }
                }
            });            
        });

    } catch (error) {
        console.error('Error rendering blogs:', error);
    }
}

async function renderPosts(blogs) {
    const postLister = document.getElementById('postLister')
    console.log('Rendering posts from', blogs)

    try {
        postLister.innerHTML = '';

        blogs.forEach(blog => {
            blog.posts.forEach(post => {
                if (post.public !== false) {
                    const postContainer = document.createElement('div');

                    const postLink = document.createElement('a');
                    postLink.href = `http://192.168.1.242:6969/posts/${post._id}`;
                    postLink.textContent = `${post.title} - ${blog.title}`;
                    postLink.classList.add('post-link');
                    postLink.dataset.postId = post._id; 
                    postContainer.appendChild(postLink);
                    postContainer.classList.add('post-container');
                    postLister.appendChild(postContainer);
                }
            });
        });

        postLister.addEventListener('click', async (event) => {
            const target = event.target;
            if (target && target.classList.contains('post-link')) {
                event.preventDefault();

                const postId = target.dataset.postId;
                const postContainer = target.closest('.post-container');
                const expandedContent = postContainer.querySelector('.expanded-content');

                console.log('expanding post', postId)

                if (expandedContent) {
                    expandedContent.remove();
                } else {
                    try {
                        const response = await fetch(`http://192.168.1.242:6969/posts/${postId}`, {
                            headers: {
                                'Cache-Control': 'no-cache',
                            }
                        });
                        const data = await response.json();

                        // Render expanded content here
                        const newExpandedContent = document.createElement('div');

                        const postContent = data.post;

                        const titleElement = document.createElement('div');
                        titleElement.textContent = `${postContent.title}`;
                        newExpandedContent.appendChild(titleElement);

                        // Render the content field
                        const contentElement = document.createElement('div');
                        contentElement.textContent = `${postContent.content}`;
                        newExpandedContent.appendChild(contentElement);

                        // Render the timestamp field
                        const timestampElement = document.createElement('div');
                        timestampElement.textContent = `${new Date(postContent.timestamp).toLocaleString()}`;
                        newExpandedContent.appendChild(timestampElement);

                        // Handle rendering of arrays or nested objects if needed
                        if (Array.isArray(postContent.hashtags) && postContent.hashtags.length > 0) {
                            const hashtagsElement = document.createElement('div');
                            hashtagsElement.textContent = `${postContent.hashtags.join(', ')}`;
                            newExpandedContent.appendChild(hashtagsElement);
                        }

                        console.log('Rendering comments from', postContent.title, ' ~ ', postContent.comments)

                        if (Array.isArray(postContent.comments) && postContent.comments.length > 0) {
                            const commentsElement = document.createElement('div');
                            postContent.comments.forEach(comment => {
                                const commentElement = document.createElement('div');
                                commentElement.textContent = `${comment.text} ~ ${comment.username}`;
                                commentsElement.appendChild(commentElement);
                            });
                            
                            // Add a link to join the discussion
                            const joinDiscussionLink = document.createElement('a');
                            joinDiscussionLink.href = 'http://192.168.1.242:5173';
                            joinDiscussionLink.textContent = 'Join the Discussion';
                            commentsElement.appendChild(joinDiscussionLink);
                            

                            newExpandedContent.appendChild(commentsElement);
                        }

                        newExpandedContent.classList.add('expanded-content');
                        console.log('Post expanded')

                        postContainer.appendChild(newExpandedContent);

                    } catch (error) {
                        console.error('Error fetching post data:', error);
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error rendering posts:', error);
    }
}

async function init() {

    await renderBlogs();
    
    const blogObjects = await getBlogs();

    renderPosts(blogObjects.blogs);
}

init();


