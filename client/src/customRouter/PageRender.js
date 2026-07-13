import React, { Suspense, lazy } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'
import PostSkeleton from '../components/skeletons/PostSkeleton'
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton'

const pages = import.meta.glob('../pages/**/*.js')

const PageRender = () => {
    const { page: paramPage, id } = useParams()
    const { auth } = useSelector(state => state)
    const location = useLocation()

    if (!auth.token) return <NotFound />

    let page = paramPage
    if (location.pathname.startsWith('/posts/tag/')) {
        page = 'posts/tag'
    }

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

