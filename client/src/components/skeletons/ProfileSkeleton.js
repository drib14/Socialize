import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ProfileSkeleton = () => {
    return (
        <div className="info mb-4">
            <div className="info_container" style={{ display: 'flex', gap: '30px', padding: '20px' }}>
                <Skeleton circle width={150} height={150} />

                <div className="info_content" style={{ flex: 1 }}>
                    <div className="d-flex align-items-center mb-3">
                        <Skeleton width={180} height={30} className="mr-3" />
                        <Skeleton width={100} height={35} />
                    </div>

                    <div className="d-flex mb-3">
                        <Skeleton width={100} height={20} className="mr-4" />
                        <Skeleton width={100} height={20} />
                    </div>

                    <Skeleton width={150} height={20} className="mb-2" />
                    <Skeleton width={120} height={16} className="mb-2" />
                    <Skeleton width="80%" height={16} />
                </div>
            </div>
        </div>
    )
}

export default ProfileSkeleton
