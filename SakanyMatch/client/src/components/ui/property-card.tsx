
import { Link } from "wouter";
import { Bed, Bath, Ruler, MapPin, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

interface Property {
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
  const {
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
  } = property;

  // Format the price with commas for thousands
  const formattedPrice = formatPrice(price);

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
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
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

      {showActions && (
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
      )}
    </Card>
  );
}
