import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters = {}, 
  onFilterChange, 
  onClearFilters, 
  isMobile = false 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    dietary: true,
    brand: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  // Price ranges removed per design request

  const dietaryOptions = [
   
  ];

  const brands = [
   
  ];

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-2 font-heading font-semibold text-foreground hover:text-primary transition-colors duration-200"
      >
        <span>{title}</span>
        <Icon 
          name={expandedSections?.[sectionKey] ? "ChevronUp" : "ChevronDown"} 
          size={16} 
        />
      </button>
      {expandedSections?.[sectionKey] && (
        <div className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          Filters
        </h2>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        )}
      </div>

      {/* Active Filters Count */}
      {(filters?.dietary?.length > 0 || filters?.brands?.length > 0) && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-primary font-medium">
              {filters?.dietary?.length + filters?.brands?.length} filters applied
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-primary hover:text-primary/80"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
      {/* Price Range removed */}

      {/* Dietary Preferences */}
      {/* <FilterSection title="Dietary & Features" sectionKey="dietary">
        {dietaryOptions?.map((option) => (
          <div key={option?.id} className="flex items-center justify-between">
            <Checkbox
              label={option?.label}
              checked={filters?.dietary?.includes(option?.id)}
              onChange={(e) => {
                const newDietary = e?.target?.checked
                  ? [...filters?.dietary, option?.id]
                  : filters?.dietary?.filter(id => id !== option?.id);
                onFilterChange('dietary', newDietary);
              }}
            />
            <span className="font-caption text-xs text-muted-foreground">
              ({option?.count})
            </span>
          </div>
        ))}
      </FilterSection> */}

      {/* Categories section removed per request */}

      {/* Brands */}
      {/* <FilterSection title="Brands" sectionKey="brand">
        {brands?.map((brand) => (
          <div key={brand?.id} className="flex items-center justify-between">
            <Checkbox
              label={brand?.label}
              checked={filters?.brands?.includes(brand?.id)}
              onChange={(e) => {
                const newBrands = e?.target?.checked
                  ? [...filters?.brands, brand?.id]
                  : filters?.brands?.filter(id => id !== brand?.id);
                onFilterChange('brands', newBrands);
              }}
            />
            <span className="font-caption text-xs text-muted-foreground">
              ({brand?.count})
            </span>
          </div>
        ))}
      </FilterSection> */}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-[1002]" onClick={onClose} />
        )}
        <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card shadow-warm-xl z-[1003] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full overflow-y-auto p-6">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {sidebarContent}
    </div>
  );
};

export default FilterSidebar;