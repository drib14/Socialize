import React from 'react'
import CardHeader from './postCard/post_card/CardHeader'
import CardBody from './postCard/post_card/CardBody'
import CardFooter from './postCard/post_card/CardFooter'

import Comments from './postCard/Comments'
import InputComment from './postCard/InputComment'

const PostCard = ({post, theme}) => {
    return (
        <div className="card my-3"> 
            <CardHeader post={post} />
            <CardBody post={post} theme={theme} />
            <CardFooter post={post} />

            <Comments post={post} />
            <InputComment post={post} />
        </div>
    )
}

export default PostCard
