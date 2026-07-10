import React, { Suspense, lazy } from 'react'
import { useParams } from 'react-router-dom'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'

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

    return (
        <Suspense fallback={<div>Loading page...</div>}>
            <LazyComponent />
        </Suspense>
    )
}

export default PageRender

