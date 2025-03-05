import { Building2, MapPin, Bath, BedDouble, Square, Tag, Bed, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Property } from "@/types/property";
import { Link } from "wouter";
import { formatPrice } from "@/lib/format";

interface PropertyCardProps {
  property: Property;
  className?: string;
  showActions?: boolean;
}

export function PropertyCard({ 
  property, 
  className,
  showActions = true 
}: PropertyCardProps) {
  // Format the price with commas for thousands
  const formattedPrice = formatPrice(property.price);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={property.images && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg'} 
          alt={property.title}
          className="object-cover w-full h-full hover:scale-105 transition-transform"
        />
        <Badge className="absolute top-2 right-2">
          {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{property.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin size={14} />
          {property.location || 'Location not specified'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {formattedPrice}
          {property.listingType === 'rent' && <span className="text-sm font-normal">/month</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1">
            <BedDouble size={16} />
            <span className="text-sm">{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span className="text-sm">{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square size={16} />
            <span className="text-sm">{property.area || 0} m²</span>
          </div>
        </div>
        <p className="text-sm line-clamp-2 text-muted-foreground">
          {property.description || 'No description available'}
        </p>
      </CardContent>
      {showActions && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link to={`/property/${property.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}