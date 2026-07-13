import React, { Suspense, lazy } from 'react'
import { useParams } from 'react-router-dom'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'
import PostSkeleton from '../components/skeletons/PostSkeleton'
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton'

const pages = import.meta.glob('../pages/**/*.js')

const PageRender = () => {
    const { page, id } = useParams()
    const { auth } = useSelector(state => state)

    if (!auth.token) return <NotFound />

    let pageName = ""
    if (id) {
        pageName = `${page}/[id]`
    } else {
        pageName = `${page}`
    }

    let key = `../pages/${pageName}.js`
    if (!pages[key]) {
        key = `../pages/${pageName}/index.js`
    }

    if (!pages[key]) {
        return <NotFound />
    }

    const LazyComponent = lazy(pages[key])

    const getSkeletonFallback = () => {
        if (page === 'profile') {
            return <ProfileSkeleton />;
        }
        return (
            <div className="container mt-4">
                <PostSkeleton />
            </div>
        );
    };

    return (
        <Suspense fallback={getSkeletonFallback()}>
            <LazyComponent />
        </Suspense>
    )
}

export default PageRender

