'use client';

import { motion } from 'framer-motion';
import { Check, X, Star, TrendingUp } from 'lucide-react';

interface SummaryTabProps {
  pros: string[];
  cons: string[];
  verdict: string;
  aspectScores: Record<string, number | null>;
}

export default function SummaryTab({ pros, cons, verdict, aspectScores }: SummaryTabProps) {
  const getAspectColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getAspectLabel = (score: number) => {
    if (score >= 0.7) return 'Excellent';
    if (score >= 0.4) return 'Good';
    return 'Needs Improvement';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const barVariants = {
    hidden: { scaleX: 0 },
    visible: (score: number) => ({
      scaleX: score,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3
      }
    })
  };

  return (
    <div className="space-y-8">
      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-luxury border-l-4 border-green-500"
        >
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-playfair font-semibold text-charcoal">Pros</h3>
          </div>
          <ul className="space-y-3">
            {pros.map((pro, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                className="flex items-start space-x-3"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-charcoal/80 leading-relaxed">{pro}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Cons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-luxury border-l-4 border-red-500"
        >
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-xl font-playfair font-semibold text-charcoal">Cons</h3>
          </div>
          <ul className="space-y-3">
            {cons.map((con, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                className="flex items-start space-x-3"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-charcoal/80 leading-relaxed">{con}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-gradient-to-r from-lilac/20 to-blush/20 rounded-2xl p-6 border border-lilac/30"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-lilac/30 rounded-full">
            <Star className="h-6 w-6 text-lilac" />
          </div>
          <h3 className="text-xl font-playfair font-semibold text-charcoal">Verdict</h3>
        </div>
        <p className="text-lg text-charcoal/80 leading-relaxed">{verdict}</p>
      </motion.div>

      {/* Aspect Scores */}
      {Object.keys(aspectScores).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-luxury"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-charcoal/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-charcoal" />
            </div>
            <h3 className="text-xl font-playfair font-semibold text-charcoal">Performance Scores</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(aspectScores).map(([aspect, score]) => {
              if (score === null) return null;
              
              const normalizedScore = Math.max(0, Math.min(1, score));
              const colorClass = getAspectColor(normalizedScore);
              const label = getAspectLabel(normalizedScore);
              
              // Enhanced aspect name formatting for category-specific aspects
              const getAspectDisplayName = (aspect: string) => {
                const aspectMap: Record<string, string> = {
                  'longevity': 'Longevity & Durability',
                  'texture': 'Texture & Blendability', 
                  'irritation': 'Gentleness (Low Irritation)',
                  'value': 'Value for Money',
                  'sillage': 'Sillage & Projection',
                  'uniqueness': 'Uniqueness & Character',
                  'versatility': 'Versatility & Occasions',
                  'coverage': 'Coverage & Buildability',
                  'color_accuracy': 'Color Accuracy',
                  'ease_of_application': 'Application Ease',
                  'effectiveness': 'Overall Effectiveness',
                  'absorption': 'Absorption & Finish',
                  'hydration': 'Hydration & Moisture',
                  'non_comedogenic': 'Pore-Friendly',
                  'durability': 'Tool Durability',
                  'ergonomics': 'Comfort & Ergonomics',
                  'cleaning_ease': 'Easy to Clean'
                };
                return aspectMap[aspect] || aspect.charAt(0).toUpperCase() + aspect.slice(1).replace(/_/g, ' ');
              };
              
              return (
                <div key={aspect} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-charcoal">
                      {getAspectDisplayName(aspect)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-charcoal/60">
                        {Math.round(normalizedScore * 100)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${colorClass}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      custom={normalizedScore}
                      variants={barVariants}
                      initial="hidden"
                      animate="visible"
                      className={`h-full ${colorClass} rounded-full origin-left`}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
