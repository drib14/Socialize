import React, { useState } from 'react'
import CardHeader from './postCard/post_card/CardHeader'
import CardBody from './postCard/post_card/CardBody'
import CardFooter from './postCard/post_card/CardFooter'

import Comments from './postCard/Comments'
import InputComment from './postCard/InputComment'

const PostCard = ({post, theme}) => {
    const isRepost = !!post.repostOf
    const isSinglePostPage = window.location.pathname.startsWith('/post/')
    const [showComments, setShowComments] = useState(isSinglePostPage)

    if (isRepost && !post.repostOf) {
        return (
            <div className="card my-4 p-4 text-center text-muted" style={{ borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)' }}>
                <i className="fas fa-exclamation-triangle mr-2 text-warning" />
                This reposted content is no longer available.
            </div>
        );
    }

    const isQuoteRepost = isRepost && post.content && post.content.trim() !== ''
    const displayPost = isRepost && !isQuoteRepost ? post.repostOf : post

    return (
        <div className="card my-4" style={{ 
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
        }}> 
            {
                isRepost && 
                <div className="px-4 pt-3 pb-2 font-weight-bold" style={{
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)', 
                    borderBottom: '1px solid var(--border-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'rgba(16, 185, 129, 0.03)'
                }}>
                    <i className="fas fa-retweet text-success mr-2" style={{ fontSize: '16px' }} />
                    <span>@{post.user.username} {isQuoteRepost ? 'quoted' : 'reposted'}</span>
                </div>
            }
            <CardHeader post={displayPost} />
            <CardBody post={displayPost} theme={theme} />
            <CardFooter post={displayPost} showComments={showComments} setShowComments={setShowComments} />

            {
                showComments && (
                    <div style={{ background: 'rgba(0,0,0,0.01)', borderTop: '1px solid var(--border-color)' }}>
                        <Comments post={displayPost} />
                        {
                            displayPost.commentsDisabled ? (
                                <div className="text-center py-3 text-muted small font-weight-bold" style={{ background: 'var(--bg-input)' }}>
                                    Commenting has been disabled for this post.
                                </div>
                            ) : (
                                <InputComment post={displayPost} />
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default PostCard
