import { Link } from "wouter";
import { Bed, Bath, Grid, MapPin, Tag, Ruler } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  forSale: boolean;
  forRent: boolean;
  featured?: boolean;
  images?: string[];
  status?: string;
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  propertyType,
  forSale,
  forRent,
  featured = false,
  images = [],
  status = "active",
}: PropertyCardProps) {
  // Format the price with commas for thousands
  const formattedPrice = new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);

  // Get the first image or use a placeholder
  const primaryImage = images && images.length > 0
    ? images[0]
    : "https://placehold.co/600x400?text=No+Image";

  // Status badge color
  const statusColors = {
    active: "bg-green-100 text-green-800",
    sold: "bg-red-100 text-red-800",
    rented: "bg-blue-100 text-blue-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const statusColor = status && statusColors[status as keyof typeof statusColors]
    ? statusColors[status as keyof typeof statusColors]
    : statusColors.active;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative">
        {featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-yellow-500">
            Featured
          </Badge>
        )}

        {status !== "active" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${statusColor}`}>
              {status}
            </span>
          </div>
        )}

        <Link href={`/property/${id}`}>
          <div className="h-48 overflow-hidden cursor-pointer">
            <img
              src={primaryImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>

        <Badge className="absolute bottom-2 right-2 bg-primary">
          {forSale && forRent ? "Sale/Rent" : forSale ? "For Sale" : "For Rent"}
        </Badge>
      </div>

      <CardContent className="p-4">
        <Link href={`/property/${id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer line-clamp-2">
            {title}
          </h3>
        </Link>

        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm truncate">{location}</span>
        </div>

        <div className="text-xl font-bold text-primary mb-3">
          {formattedPrice}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="flex items-center text-sm">
            <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{bedrooms} Beds</span>
          </div>

          <div className="flex items-center text-sm">
            <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{bathrooms} Baths</span>
          </div>

          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{area} sqm</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t flex justify-between">
        <div className="flex items-center text-sm">
          <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="capitalize">{propertyType}</span>
        </div>

        <Link href={`/property/${id}`}>
          <span className="text-sm font-medium text-primary hover:underline">
            View Details
          </span>
        </Link>
      </CardFooter>
    </Card>
  );
}
import { Building2, MapPin, Bath, BedDouble, Square } from "lucide-react";
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