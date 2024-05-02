// scripts.js

async function getBlogs() {
    console.log('Getting blogs...')

    const BLOGS_API = 'https://hollow-volcano-ghoul.glitch.me/profile'
    
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
            blogLink.href = `https://hollow-volcano-ghoul.glitch.me/${blog.url}`;
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
                        const response = await fetch(`https://hollow-volcano-ghoul.glitch.me/${blog.url}`);
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


async function getPosts() {
    console.log('Getting posts...')

    const POST_API = 'https://hollow-volcano-ghoul.glitch.me/posts'
    
    try {

        const response = await fetch(POST_API)

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        // Parse the JSON response
        const posts = await response.json();

        console.log(posts)
        return posts
    } catch (error) {
        console.error('Error fetching posts:', error);
        return null;
    }
}

async function renderPosts(posts) {
    const postLister = document.getElementById('postLister');
    console.log('Rendering posts from', posts);

    try {
        postLister.innerHTML = '';

        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        posts.forEach(post => {
            if (post.public !== false) {
                const postContainer = document.createElement('div');

                const postLink = document.createElement('a');
                postLink.href = `https://hollow-volcano-ghoul.glitch.me/posts/${post._id}`;
                postLink.textContent = `${post.title} - ${post.author}`;
                postLink.classList.add('post-link');
                postLink.dataset.postId = post._id;
                postContainer.appendChild(postLink);
                postContainer.classList.add('post-container');
                postLister.appendChild(postContainer);

                const postId = post._id;

                postLink.addEventListener('click', async (event) => {
                    event.preventDefault();

                    const expandedContent = postContainer.querySelector('.expanded-content');

                    console.log('Expanding post', postId, postLink.href);

                    if (expandedContent) {
                        expandedContent.remove();
                    } else {
                        // Render expanded content here
                        const newExpandedContent = document.createElement('div');

                        const postContent = post;

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

                        console.log('Rendering comments from', postContent.title, ' ~ ', postContent.comments);

                        if (Array.isArray(postContent.comments) && postContent.comments.length > 0) {
                            const commentsElement = document.createElement('div');
                            postContent.comments.forEach(comment => {
                                const commentElement = document.createElement('div');
                                commentElement.textContent = `${comment.text} ~ ${comment.username}`;
                                commentsElement.appendChild(commentElement);
                                commentElement.classList.add('each-comment');
                            });

                            // Add a link to join the discussion
                            const joinDiscussionLink = document.createElement('a');
                            joinDiscussionLink.href = 'https://a28205f2.blog-react-dashboard.pages.dev';
                            joinDiscussionLink.textContent = 'Join the Discussion';
                            commentsElement.appendChild(joinDiscussionLink);

                            newExpandedContent.appendChild(commentsElement);
                            commentsElement.classList.add('commentsElement');
                            joinDiscussionLink.classList.add('comment-link');
                        }

                        newExpandedContent.classList.add('expanded-content');
                        console.log('Post expanded');

                        postContainer.appendChild(newExpandedContent);
                    }
                });
            }
        });

    } catch (error) {
        console.error('Error rendering posts:', error);
    }
}

async function init() {

    await renderBlogs();
    
    const posts = await getPosts();

    renderPosts(posts.posts);
}

init();


