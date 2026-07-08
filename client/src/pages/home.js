import React, { useEffect } from 'react'

import Status from '../components/home/Status'
import Posts from '../components/home/Posts'
import LeftSideBar from '../components/home/LeftSideBar'
import RightSideBar from '../components/home/RightSideBar'

import { useSelector } from 'react-redux'
import PostSkeleton from '../components/skeletons/PostSkeleton'


let scroll = 0;

const Home = () => {
    const { homePosts } = useSelector(state => state)

    window.addEventListener('scroll', () => {
        if(window.location.pathname === '/'){
            scroll = window.pageYOffset
            return scroll;
        }
    })

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({top: scroll, behavior: 'smooth'})
        }, 100)
    },[])

    return (
        <div className="home row mx-0" style={{ width: '100%' }}>
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <LeftSideBar />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
                <Status />

                {
                    homePosts.loading 
                    ? <>
                        <PostSkeleton />
                        <PostSkeleton />
                      </>
                    : (homePosts.result === 0 && homePosts.posts.length === 0)
                        ? <h2 className="text-center">No Post</h2>
                        : <Posts />
                }
                
            </div>
            
            <div className="col-md-3 col-lg-3 d-none d-md-block">
                <RightSideBar />
            </div>
        </div>
    )
}

export default Home
