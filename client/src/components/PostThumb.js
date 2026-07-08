import React from 'react'
import { Link } from 'react-router-dom'

const PostThumb = ({posts, result, handleUnSave}) => {

    if(result === 0) return <h2 className="text-center text-danger">No Post</h2>

    return (
        <div className="post_thumb">
            {
                posts.map(post => (
                    <Link key={post._id} to={`/post/${post._id}`}>
                        <div className="post_thumb_display position-relative">
                            
                            {
                                handleUnSave && (
                                    <button 
                                        className="btn position-absolute text-danger" 
                                        style={{ 
                                            top: '8px', 
                                            right: '8px', 
                                            zIndex: 10, 
                                            padding: '4px', 
                                            background: 'rgba(255, 255, 255, 0.85)', 
                                            borderRadius: '50%', 
                                            minWidth: 'auto', 
                                            height: 'auto', 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)' 
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleUnSave(post);
                                        }}
                                        title="Unsave post"
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>bookmark_remove</span>
                                    </button>
                                )
                            }

                            {
                                post.images && post.images.length > 0 && (post.images[0]?.url || typeof post.images[0] === 'string')
                                ? (
                                    (typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url).match(/video/i)
                                    ?<video src={typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url} alt="post thumb" />
                                    :<img src={typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url} alt="post thumb" />
                                  )
                                : (
                                    <div className="post_thumb_text">
                                        {post.content}
                                    </div>
                                  )
                            }

                            <div className="post_thumb_menu">
                                <i className="far fa-heart">{post.likes.length}</i>
                                <i className="far fa-comment">{post.comments.length}</i>
                            </div>
                        </div>
                    </Link>
                ))
            }
        </div>
    )
}

export default PostThumb
