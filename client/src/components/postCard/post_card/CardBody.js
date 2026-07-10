import React, { useState } from 'react'
import Carousel from '../../Carousel'
import { Link } from 'react-router-dom'

const CardBody = ({post, theme}) => {
    const [readMore, setReadMore] = useState(false)

    const renderContent = (content) => {
        if (!content) return '';
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link key={index} to={`/profile_by_username/${username}`} style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <div className="card_body">
            <div className="card_body-content" 
            style={{
                color: 'var(--text-main)',
            }}>
                <span>
                    {
                        post.content.length < 60 
                        ? renderContent(post.content) 
                        : readMore ? renderContent(post.content) : renderContent(post.content.slice(0, 60) + '.....')
                    }
                </span>
                {
                    post.content.length > 60 &&
                    <span className="readMore" onClick={() => setReadMore(!readMore)}>
                        {readMore ? 'Hide content' : 'Read more'}
                    </span>
                }

            </div>
            {
                post.images.length > 0 && <Carousel images={post.images} id={post._id} />
            }
        </div>
    )
}

export default CardBody
