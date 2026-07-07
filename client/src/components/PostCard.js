import React from 'react'
import CardHeader from './postCard/post_card/CardHeader'
import CardBody from './postCard/post_card/CardBody'
import CardFooter from './postCard/post_card/CardFooter'

import Comments from './postCard/Comments'
import InputComment from './postCard/InputComment'

const PostCard = ({post, theme}) => {
    const isRepost = !!post.repostOf

    if (isRepost && !post.repostOf) {
        return (
            <div className="card my-3 p-4 text-center text-muted" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                <i className="fas fa-exclamation-triangle mr-2 text-warning" />
                This reposted content is no longer available.
            </div>
        );
    }

    const displayPost = isRepost ? post.repostOf : post

    return (
        <div className="card my-3" style={{ borderRadius: 'var(--radius-lg)' }}> 
            {
                isRepost && 
                <div className="px-4 pt-3 font-weight-bold" style={{fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="fas fa-retweet text-success" style={{ fontSize: '18px' }} />
                    <span>{post.user.username} reposted</span>
                </div>
            }
            <CardHeader post={displayPost} />
            <CardBody post={displayPost} theme={theme} />
            <CardFooter post={displayPost} />

            <Comments post={displayPost} />
            <InputComment post={displayPost} />
        </div>
    )
}

export default PostCard
