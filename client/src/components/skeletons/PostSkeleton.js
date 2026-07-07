import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const PostSkeleton = () => {
    return (
        <div className="card my-3" style={{ padding: '15px' }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-3">
                <Skeleton circle width={50} height={50} className="mr-3" />
                <div style={{ flex: 1 }}>
                    <Skeleton width={120} height={18} />
                    <Skeleton width={80} height={12} className="mt-1" />
                </div>
            </div>

            {/* Body */}
            <div className="mb-3">
                <Skeleton count={2} height={15} className="mb-1" />
                <Skeleton width="60%" height={15} />
            </div>

            {/* Media Content */}
            <Skeleton height={250} borderRadius={8} className="mb-3" />

            {/* Footer */}
            <div className="d-flex justify-content-between">
                <Skeleton width={80} height={20} />
                <Skeleton width={100} height={20} />
            </div>
        </div>
    )
}

export default PostSkeleton
