import React from 'react'
import { Link } from 'react-router-dom'

const PostThumb = ({posts, result}) => {

    if(result === 0) return <h2 className="text-center text-danger">No Post</h2>

    return (
        <div className="post_thumb">
            {
                posts.map(post => (
                    <Link key={post._id} to={`/post/${post._id}`}>
                        <div className="post_thumb_display">

                            {
                                post.images && post.images.length > 0
                                ? (
                                    post.images[0].url.match(/video/i)
                                    ?<video src={post.images[0].url} alt={post.images[0].url} />
                                    :<img src={post.images[0].url} alt={post.images[0].url} />
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
