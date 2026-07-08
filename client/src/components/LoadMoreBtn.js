import React from 'react'

const LoadMoreBtn = ({result, page, load, handleLoadMore}) => {
    return (
        <>
            {
                result < 9 * (page - 1) ? '' : 

                !load && <button className="btn btn-dark mx-auto d-block"
                onClick={handleLoadMore} title="Load more">
                    <span className="material-icons">expand_more</span>
                </button>
            }
            
        </>
    )
}

export default LoadMoreBtn
