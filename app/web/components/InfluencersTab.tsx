'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, Heart, Eye, Users, Calendar } from 'lucide-react';

interface YoutubeReview {
  creator: string;
  channel: string;
  title: string;
  summary: string;
  rating: string;
  views?: string;
  date?: string;
  url: string;
}

interface InstagramReview {
  creator: string;
  handle: string;
  post_type: string;
  summary: string;
  likes?: string;
  date?: string;
  url: string;
}

interface InfluencerPlatform {
  reviews?: YoutubeReview[] | InstagramReview[];
  summary?: string;
}

interface InfluencersTabProps {
  youtube?: InfluencerPlatform;
  instagram?: InfluencerPlatform;
}

export default function InfluencersTab({ youtube, instagram }: InfluencersTabProps) {
  const [activeInfluencerTab, setActiveInfluencerTab] = useState<'youtube' | 'instagram'>('youtube');

  const hasYouTubeData = youtube?.reviews && youtube.reviews.length > 0;
  const hasInstagramData = instagram?.reviews && instagram.reviews.length > 0;
  const hasAnyData = hasYouTubeData || hasInstagramData;

  if (!hasAnyData) {
    return (
      <div className="text-center py-16">
        <Users className="h-16 w-16 text-charcoal/30 mx-auto mb-4" />
        <h3 className="text-xl font-playfair text-charcoal mb-2">No Influencer Data</h3>
        <p className="text-charcoal/70">Influencer reviews will appear here after data ingestion</p>
        <p className="text-charcoal/50 text-sm mt-2">Use the &quot;Adaptive AI&quot; or &quot;Complete Refresh&quot; buttons in admin to collect influencer content</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {hasYouTubeData && (
          <button
            onClick={() => setActiveInfluencerTab('youtube')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeInfluencerTab === 'youtube'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>YouTube</span>
            </div>
          </button>
        )}
        {hasInstagramData && (
          <button
            onClick={() => setActiveInfluencerTab('instagram')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeInfluencerTab === 'instagram'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Instagram</span>
            </div>
          </button>
        )}
      </div>

      {/* Platform Summary */}
      {activeInfluencerTab === 'youtube' && youtube?.summary && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">YouTube Consensus</h3>
          <p className="text-red-700">{youtube.summary}</p>
        </div>
      )}

      {activeInfluencerTab === 'instagram' && instagram?.summary && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-pink-800 mb-2">Instagram Consensus</h3>
          <p className="text-pink-700">{instagram.summary}</p>
        </div>
      )}

      {/* YouTube Reviews */}
      {activeInfluencerTab === 'youtube' && hasYouTubeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {(youtube.reviews as YoutubeReview[]).map((review, index) => (
            <div key={index} className="bg-white border border-red-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">{review.creator}</h4>
                    <p className="text-sm text-charcoal/60">{review.channel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {review.rating}
                  </div>
                </div>
              </div>

              <h5 className="font-medium text-charcoal mb-2">{review.title}</h5>
              <p className="text-charcoal/80 mb-4">{review.summary}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-charcoal/60">
                  {review.views && (
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{review.views} views</span>
                    </div>
                  )}
                  {review.date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{review.date}</span>
                    </div>
                  )}
                </div>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                >
                  <span className="text-sm font-medium">Watch Review</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Instagram Reviews */}
      {activeInfluencerTab === 'instagram' && hasInstagramData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {(instagram.reviews as InstagramReview[]).map((review, index) => (
            <div key={index} className="bg-white border border-pink-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">{review.creator}</h4>
                    <p className="text-sm text-charcoal/60">{review.handle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                    {review.post_type}
                  </div>
                </div>
              </div>

              <p className="text-charcoal/80 mb-4">{review.summary}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-charcoal/60">
                  {review.likes && (
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{review.likes} likes</span>
                    </div>
                  )}
                  {review.date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{review.date}</span>
                    </div>
                  )}
                </div>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <span className="text-sm font-medium">View Post</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
