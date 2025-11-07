import React from 'react';
import { useLocation } from 'react-router-dom';
import DogTreats from './DogTreats';
import WalkEssentials from './WalkEssentials';
import DogFood from './DogFood';

export default function ShopForDogsIndex() {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get('category') || '';
  const cat = q.toLowerCase();

  if (cat === 'walk-essentials' || cat === 'walkessentials' || cat === 'walk') {
    return <WalkEssentials />;
  }

  if (cat.includes('treat')) {
    return <DogTreats />;
  }

  if (cat.includes('food') || cat === 'dogfood' || cat === 'dog-food') {
    return <DogFood />;
  }

  // default: preserve previous behavior (treats)
  return <DogTreats />;
}
